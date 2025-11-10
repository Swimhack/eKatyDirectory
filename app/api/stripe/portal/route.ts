import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user with Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/restaurant-dashboard`
    })

    return NextResponse.json({
      url: session.url
    })

  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session', message: error.message },
      { status: 500 }
    )
  }
}
