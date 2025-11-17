import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Flyer URLs (these would be actual R2/S3 URLs in production)
const FLYER_URLS = {
  'social-instagram': '/flyers/ekaty-instagram-launch.png',
  'social-facebook': '/flyers/ekaty-facebook-launch.png',
  'social-twitter': '/flyers/ekaty-twitter-launch.png',
  'printable-poster': '/flyers/ekaty-poster-8x11.pdf',
  'printable-flyer': '/flyers/ekaty-flyer-letter.pdf',
  'business-card': '/flyers/ekaty-business-card.pdf',
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const flyerType = url.searchParams.get('type')

    if (!flyerType) {
      // Return all available flyers
      return NextResponse.json({
        flyers: [
          {
            type: 'social-instagram',
            name: 'Instagram Post',
            format: 'png',
            dimensions: '1080x1080',
            category: 'social'
          },
          {
            type: 'social-facebook',
            name: 'Facebook Post',
            format: 'png',
            dimensions: '1200x630',
            category: 'social'
          },
          {
            type: 'social-twitter',
            name: 'Twitter/X Post',
            format: 'png',
            dimensions: '1200x675',
            category: 'social'
          },
          {
            type: 'printable-poster',
            name: 'Printable Poster',
            format: 'pdf',
            dimensions: '8.5x11',
            category: 'printable'
          },
          {
            type: 'printable-flyer',
            name: 'Printable Flyer',
            format: 'pdf',
            dimensions: 'Letter',
            category: 'printable'
          },
          {
            type: 'business-card',
            name: 'Business Card',
            format: 'pdf',
            dimensions: '3.5x2',
            category: 'printable'
          }
        ]
      })
    }

    // Get specific flyer URL
    const downloadUrl = FLYER_URLS[flyerType as keyof typeof FLYER_URLS]
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Invalid flyer type' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      flyerType,
      downloadUrl
    })
  } catch (error) {
    console.error('Flyer GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve flyer' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flyerType, email, name } = body

    if (!flyerType) {
      return NextResponse.json(
        { error: 'Flyer type is required' },
        { status: 400 }
      )
    }

    const downloadUrl = FLYER_URLS[flyerType as keyof typeof FLYER_URLS]
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Invalid flyer type' },
        { status: 404 }
      )
    }

    // Determine format from URL
    const format = downloadUrl.endsWith('.pdf') ? 'pdf' :
                  downloadUrl.endsWith('.png') ? 'png' : 'jpg'

    // Track download
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const download = await prisma.flyerDownload.create({
      data: {
        flyerType,
        format,
        email: email?.toLowerCase() || null,
        name: name || null,
        downloadUrl,
        ipAddress,
        userAgent: request.headers.get('user-agent') || null
      }
    })

    // Update daily metrics
    const today = new Date().toISOString().split('T')[0]
    await prisma.launchMetric.upsert({
      where: { date: today },
      create: {
        date: today,
        flyersDownloaded: 1
      },
      update: {
        flyersDownloaded: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      downloadId: download.id
    })
  } catch (error) {
    console.error('Flyer download error:', error)
    return NextResponse.json(
      { error: 'Failed to track flyer download' },
      { status: 500 }
    )
  }
}

// PATCH - Track social shares
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { downloadId } = body

    if (!downloadId) {
      return NextResponse.json(
        { error: 'Download ID is required' },
        { status: 400 }
      )
    }

    await prisma.flyerDownload.update({
      where: { id: downloadId },
      data: {
        shareCount: {
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
        socialShares: 1
      },
      update: {
        socialShares: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully'
    })
  } catch (error) {
    console.error('Share tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    )
  }
}
