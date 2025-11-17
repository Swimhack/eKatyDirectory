import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Achievement definitions
const ACHIEVEMENTS = {
  'first-100-users': {
    name: 'Early Pioneer',
    icon: '🚀',
    description: 'One of the first 100 users on eKaty',
    reward: 'Exclusive launch badge and early access to new features'
  },
  'first-500-users': {
    name: 'Launch Champion',
    icon: '🏆',
    description: 'Joined within the first 500 users',
    reward: 'Special launch champion badge'
  },
  'first-spin': {
    name: 'Grub Roulette Explorer',
    icon: '🎰',
    description: 'Tried Grub Roulette for the first time',
    reward: 'Roulette enthusiast badge'
  },
  'first-review': {
    name: 'Community Contributor',
    icon: '✍️',
    description: 'Wrote your first restaurant review',
    reward: 'Reviewer badge and priority review visibility'
  },
  'first-favorite': {
    name: 'Foodie Curator',
    icon: '❤️',
    description: 'Saved your first favorite restaurant',
    reward: 'Curator badge'
  },
  'giveaway-participant': {
    name: 'Giveaway Participant',
    icon: '🎁',
    description: 'Entered the $500 launch giveaway',
    reward: 'Participant badge and bonus giveaway entry'
  },
  'coupon-redeemer': {
    name: 'Deal Hunter',
    icon: '🎫',
    description: 'Redeemed your first launch coupon',
    reward: 'Deal hunter badge and priority coupon access'
  },
  'flyer-sharer': {
    name: 'Brand Ambassador',
    icon: '📣',
    description: 'Downloaded and shared eKaty promotional materials',
    reward: 'Ambassador badge and exclusive deals'
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const achievements = await prisma.earlyAdopterAchievement.findMany({
      where: { email: email.toLowerCase() },
      orderBy: { earnedAt: 'desc' }
    })

    return NextResponse.json({
      achievements,
      totalCount: achievements.length,
      badges: achievements.map(a => a.badgeIcon).join('')
    })
  } catch (error) {
    console.error('Achievement GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve achievements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, achievementType } = body

    if (!email || !achievementType) {
      return NextResponse.json(
        { error: 'Email and achievement type are required' },
        { status: 400 }
      )
    }

    const achievementDef = ACHIEVEMENTS[achievementType as keyof typeof ACHIEVEMENTS]
    if (!achievementDef) {
      return NextResponse.json(
        { error: 'Invalid achievement type' },
        { status: 404 }
      )
    }

    // Check if user already has this achievement
    const existing = await prisma.earlyAdopterAchievement.findFirst({
      where: {
        email: email.toLowerCase(),
        achievementType
      }
    })

    if (existing) {
      return NextResponse.json({
        alreadyEarned: true,
        achievement: existing
      })
    }

    // Award achievement
    const achievement = await prisma.earlyAdopterAchievement.create({
      data: {
        email: email.toLowerCase(),
        achievementType,
        badgeName: achievementDef.name,
        badgeIcon: achievementDef.icon,
        rewardDescription: achievementDef.reward,
        metadata: JSON.stringify({
          description: achievementDef.description,
          earnedDate: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      success: true,
      newAchievement: true,
      achievement: {
        id: achievement.id,
        name: achievement.badgeName,
        icon: achievement.badgeIcon,
        description: achievementDef.description,
        reward: achievement.rewardDescription
      }
    })
  } catch (error) {
    console.error('Achievement POST error:', error)
    return NextResponse.json(
      { error: 'Failed to award achievement' },
      { status: 500 }
    )
  }
}

// Automatic achievement checking endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const newAchievements: any[] = []

    // Check for user count milestones
    const userCount = await prisma.user.count()

    if (userCount <= 100) {
      const hasFirst100 = await prisma.earlyAdopterAchievement.findFirst({
        where: { email: email.toLowerCase(), achievementType: 'first-100-users' }
      })

      if (!hasFirst100) {
        const achievement = await prisma.earlyAdopterAchievement.create({
          data: {
            email: email.toLowerCase(),
            achievementType: 'first-100-users',
            badgeName: ACHIEVEMENTS['first-100-users'].name,
            badgeIcon: ACHIEVEMENTS['first-100-users'].icon,
            rewardDescription: ACHIEVEMENTS['first-100-users'].reward
          }
        })
        newAchievements.push(achievement)
      }
    } else if (userCount <= 500) {
      const hasFirst500 = await prisma.earlyAdopterAchievement.findFirst({
        where: { email: email.toLowerCase(), achievementType: 'first-500-users' }
      })

      if (!hasFirst500) {
        const achievement = await prisma.earlyAdopterAchievement.create({
          data: {
            email: email.toLowerCase(),
            achievementType: 'first-500-users',
            badgeName: ACHIEVEMENTS['first-500-users'].name,
            badgeIcon: ACHIEVEMENTS['first-500-users'].icon,
            rewardDescription: ACHIEVEMENTS['first-500-users'].reward
          }
        })
        newAchievements.push(achievement)
      }
    }

    return NextResponse.json({
      success: true,
      newAchievements: newAchievements.length,
      achievements: newAchievements
    })
  } catch (error) {
    console.error('Achievement check error:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}
