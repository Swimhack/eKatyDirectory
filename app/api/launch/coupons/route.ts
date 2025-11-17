import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Generate a unique coupon code
function generateCouponCode(prefix = 'EKATY'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET - Retrieve user's coupons or check coupon validity
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const code = url.searchParams.get('code')

    if (code) {
      // Check specific coupon validity
      const coupon = await prisma.launchCoupon.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          redemptions: {
            where: email ? { email: email.toLowerCase() } : undefined
          }
        }
      })

      if (!coupon) {
        return NextResponse.json(
          { error: 'Coupon not found' },
          { status: 404 }
        )
      }

      const now = new Date()
      const isValid = coupon.active &&
                     coupon.validFrom <= now &&
                     coupon.validUntil >= now &&
                     coupon.redemptionCount < coupon.maxRedemptions

      const userRedemptions = email ? coupon.redemptions.length : 0
      const canRedeem = isValid && userRedemptions < coupon.perUserLimit

      return NextResponse.json({
        coupon: {
          code: coupon.code,
          restaurantName: coupon.restaurantName || 'All Participating Restaurants',
          discountPercent: coupon.discountPercent,
          maxDiscount: coupon.maxDiscount,
          minPurchase: coupon.minPurchase,
          validUntil: coupon.validUntil,
          termsAndConditions: coupon.termsAndConditions
        },
        isValid,
        canRedeem,
        remainingRedemptions: coupon.maxRedemptions - coupon.redemptionCount,
        userRedemptions
      })
    }

    if (email) {
      // Get user's redeemed coupons
      const redemptions = await prisma.couponRedemption.findMany({
        where: { email: email.toLowerCase() },
        include: {
          coupon: true
        },
        orderBy: { redemptionDate: 'desc' }
      })

      return NextResponse.json({ redemptions })
    }

    // Get all active coupons
    const coupons = await prisma.launchCoupon.findMany({
      where: {
        active: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      coupons: coupons.map(c => ({
        code: c.code,
        restaurantName: c.restaurantName || 'All Participating Restaurants',
        discountPercent: c.discountPercent,
        maxDiscount: c.maxDiscount,
        minPurchase: c.minPurchase,
        validUntil: c.validUntil,
        remaining: c.maxRedemptions - c.redemptionCount
      }))
    })
  } catch (error) {
    console.error('Coupon GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve coupons' },
      { status: 500 }
    )
  }
}

// POST - Generate new coupon or redeem existing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, name, phone, code, restaurantId, orderValue } = body

    if (action === 'generate') {
      // Admin action to create new coupon
      const couponCode = generateCouponCode('EKATY20')

      const coupon = await prisma.launchCoupon.create({
        data: {
          code: couponCode,
          restaurantId: restaurantId || null,
          restaurantName: body.restaurantName || null,
          discountPercent: body.discountPercent || 20,
          maxDiscount: body.maxDiscount || null,
          minPurchase: body.minPurchase || null,
          validFrom: new Date(body.validFrom || new Date()),
          validUntil: new Date(body.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days default
          maxRedemptions: body.maxRedemptions || 100,
          perUserLimit: body.perUserLimit || 1,
          termsAndConditions: body.termsAndConditions || null
        }
      })

      // Update daily metrics
      const today = new Date().toISOString().split('T')[0]
      await prisma.launchMetric.upsert({
        where: { date: today },
        create: {
          date: today,
          couponsGenerated: 1
        },
        update: {
          couponsGenerated: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        coupon: {
          code: coupon.code,
          validUntil: coupon.validUntil
        }
      })
    }

    if (action === 'redeem') {
      // User redemption
      if (!email || !code) {
        return NextResponse.json(
          { error: 'Email and coupon code are required' },
          { status: 400 }
        )
      }

      const coupon = await prisma.launchCoupon.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          redemptions: {
            where: { email: email.toLowerCase() }
          }
        }
      })

      if (!coupon) {
        return NextResponse.json(
          { error: 'Invalid coupon code' },
          { status: 404 }
        )
      }

      const now = new Date()
      if (!coupon.active || coupon.validFrom > now || coupon.validUntil < now) {
        return NextResponse.json(
          { error: 'Coupon is not valid' },
          { status: 400 }
        )
      }

      if (coupon.redemptionCount >= coupon.maxRedemptions) {
        return NextResponse.json(
          { error: 'Coupon redemption limit reached' },
          { status: 400 }
        )
      }

      if (coupon.redemptions.length >= coupon.perUserLimit) {
        return NextResponse.json(
          { error: 'You have already used this coupon' },
          { status: 400 }
        )
      }

      // Calculate discount
      let discountAmount = orderValue ? (orderValue * coupon.discountPercent / 100) : 0
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }

      // Create redemption
      const redemption = await prisma.couponRedemption.create({
        data: {
          couponId: coupon.id,
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          restaurantId: restaurantId || null,
          orderValue: orderValue || null,
          discountAmount,
          metadata: JSON.stringify({
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString()
          })
        }
      })

      // Update coupon redemption count
      await prisma.launchCoupon.update({
        where: { id: coupon.id },
        data: {
          redemptionCount: {
            increment: 1
          }
        }
      })

      // Update daily metrics
      const today = new Date().toISOString().split('T')[0]
      await prisma.launchMetric.upsert({
        where: { date: today },
        create: {
          date: today,
          couponsRedeemed: 1
        },
        update: {
          couponsRedeemed: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Coupon redeemed successfully!',
        redemption: {
          id: redemption.id,
          discountAmount,
          restaurantName: coupon.restaurantName || 'All Participating Restaurants'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Coupon POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process coupon request' },
      { status: 500 }
    )
  }
}
