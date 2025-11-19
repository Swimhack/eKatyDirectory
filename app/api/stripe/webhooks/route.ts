import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia'
  })
}

const prisma = new PrismaClient()

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, restaurantId, tier } = session.metadata!

  // Create pending claim request
  await prisma.restaurantClaim.create({
    data: {
      userId,
      restaurantId,
      status: 'pending',
      verificationMethod: 'stripe_payment'
    }
  })

  // Auto-verify based on payment
  await autoVerifyClaim(userId, restaurantId, tier)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { userId, restaurantId, tier } = subscription.metadata

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: subscription.status,
      tier,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })

  // If subscription is active, ensure ownership is verified
  if (subscription.status === 'active') {
    await ensureRestaurantOwnership(userId, restaurantId)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { userId, restaurantId } = subscription.metadata

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' }
  })

  // Revoke restaurant ownership
  await prisma.restaurantOwner.updateMany({
    where: { userId, restaurantId },
    data: { verified: false }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Log failed payment and potentially notify user
  console.log(`Payment failed for invoice: ${invoice.id}`)
}

async function autoVerifyClaim(userId: string, restaurantId: string, tier: string) {
  // Get user and restaurant details
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  if (!user || !restaurant) return

  let autoApprove = false
  let verificationMethod = 'manual'
  const verificationData: any = {}

  // Auto-verify if email domain matches restaurant website
  if (restaurant.website && user.email) {
    const emailDomain = user.email.split('@')[1]
    const websiteDomain = new URL(restaurant.website).hostname.replace('www.', '')
    
    if (emailDomain === websiteDomain) {
      autoApprove = true
      verificationMethod = 'email_domain'
      verificationData.emailDomain = emailDomain
      verificationData.websiteDomain = websiteDomain
    }
  }

  // Update claim status
  await prisma.restaurantClaim.updateMany({
    where: {
      userId,
      restaurantId,
      status: 'pending'
    },
    data: {
      status: autoApprove ? 'approved' : 'pending',
      verificationMethod,
      verificationData: JSON.stringify(verificationData),
      ...(autoApprove && {
        reviewedAt: new Date()
      })
    }
  })

  // If auto-approved, create restaurant ownership
  if (autoApprove) {
    await ensureRestaurantOwnership(userId, restaurantId)
  }
}

async function ensureRestaurantOwnership(userId: string, restaurantId: string) {
  await prisma.restaurantOwner.upsert({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    },
    create: {
      userId,
      restaurantId,
      role: 'owner',
      verified: true
    },
    update: {
      verified: true
    }
  })
}
