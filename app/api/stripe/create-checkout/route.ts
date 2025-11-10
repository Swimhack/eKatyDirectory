import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

const prisma = new PrismaClient()

const PRICE_IDS = {
  owner: process.env.STRIPE_PRICE_OWNER!,      // $10/mo
  featured: process.env.STRIPE_PRICE_FEATURED!, // $99/mo
  premium: process.env.STRIPE_PRICE_PREMIUM!    // $199/mo
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, restaurantId, tier = 'owner' } = body

    if (!userId || !restaurantId) {
      return NextResponse.json(
        { error: 'User ID and Restaurant ID are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription for this restaurant
    const existingClaim = await prisma.restaurantOwner.findFirst({
      where: {
        userId,
        restaurantId,
        verified: true
      }
    })

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already own this restaurant' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      })

      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId }
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[tier as keyof typeof PRICE_IDS],
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/restaurant-dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/restaurants/${restaurant.slug}?canceled=true`,
      metadata: {
        userId,
        restaurantId,
        tier
      },
      subscription_data: {
        metadata: {
          userId,
          restaurantId,
          tier
        }
      }
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    )
  }
}
