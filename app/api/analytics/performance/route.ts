import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      page,
      ttfb,
      fcp,
      lcp,
      fid,
      cls,
      loadTime,
      domReady,
      deviceType,
      browser,
      connectionType,
    } = body

    if (!page) {
      return NextResponse.json(
        { error: 'Page is required' },
        { status: 400 }
      )
    }

    // Create performance record
    const performance = await prisma.pagePerformance.create({
      data: {
        page,
        ttfb: ttfb || null,
        fcp: fcp || null,
        lcp: lcp || null,
        fid: fid || null,
        cls: cls || null,
        loadTime: loadTime || null,
        domReady: domReady || null,
        deviceType: deviceType || null,
        browser: browser || null,
        connectionType: connectionType || null,
      },
    })

    return NextResponse.json({ success: true, id: performance.id })
  } catch (error) {
    console.error('Performance tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track performance' },
      { status: 500 }
    )
  }
}
