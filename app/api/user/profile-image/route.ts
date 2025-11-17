import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { uploadToR2, isR2Configured } from '@/lib/r2-storage'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('Profile image upload - User:', user.email, 'File:', file?.name, 'Size:', file?.size)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 2MB for profile images)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `profiles/${user.id}-${timestamp}-${randomString}.${extension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Try R2 first if configured
    if (isR2Configured()) {
      try {
        const url = await uploadToR2(buffer, filename, file.type)
        console.log('Profile image uploaded to R2:', url)

        // Update user profile image URL in database
        await prisma.user.update({
          where: { id: user.id },
          data: { profileImageUrl: url }
        })

        return NextResponse.json({
          success: true,
          url,
          filename
        })
      } catch (r2Error) {
        console.error('R2 upload failed:', r2Error)
        return NextResponse.json({
          error: 'Failed to upload image to cloud storage. Please configure R2 credentials.'
        }, { status: 500 })
      }
    }

    // R2 not configured
    return NextResponse.json({
      error: 'Cloud storage not configured. Profile images require Cloudflare R2 setup.'
    }, { status: 501 })

  } catch (error) {
    console.error('Profile image upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile image'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE endpoint to remove profile image
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove profile image URL from database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile image delete error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove profile image'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
