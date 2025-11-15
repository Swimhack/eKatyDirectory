import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { uploadToR2, isR2Configured } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo', 'hero', or 'photo'

    console.log('Upload API - Received file:', file?.name, 'type:', type, 'size:', file?.size)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `restaurants/${type}-${timestamp}-${randomString}.${extension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Try R2 first if configured
    if (isR2Configured()) {
      try {
        const url = await uploadToR2(buffer, filename, file.type)
        console.log('File uploaded to R2:', url)
        return NextResponse.json({ 
          success: true, 
          url,
          filename 
        })
      } catch (r2Error) {
        console.error('R2 upload failed, falling back to local:', r2Error)
        // Fall through to local storage
      }
    }

    // Check if we're in production without R2
    const isProduction = process.env.FLY_APP_NAME || process.env.NODE_ENV === 'production'
    
    if (isProduction) {
      console.error('Upload attempted in production - cloud storage not configured')
      return NextResponse.json({ 
        error: 'File uploads require cloud storage configuration. Please use direct image URLs for now.' 
      }, { status: 501 })
    }

    // Local development: save to filesystem
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'restaurants')
    
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
        console.log('Created uploads directory:', uploadsDir)
      }
    } catch (mkdirError) {
      console.error('Failed to create directory:', mkdirError)
      throw new Error('Cannot create uploads directory')
    }

    const localFilename = `${type}-${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, localFilename)
    
    try {
      await writeFile(filepath, buffer)
      console.log('File saved successfully to:', filepath)
    } catch (writeError) {
      console.error('Failed to write file:', writeError)
      throw new Error('Cannot write file to disk')
    }

    // Return the public URL
    const url = `/uploads/restaurants/${localFilename}`

    return NextResponse.json({ 
      success: true, 
      url,
      filename 
    })
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
