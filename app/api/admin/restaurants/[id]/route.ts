import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Fetch restaurant for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Parse metadata to get heroImage
    let metadata: any = {}
    try {
      metadata = restaurant.metadata ? JSON.parse(restaurant.metadata) : {}
    } catch (e) {
      console.error('Error parsing metadata in GET:', e)
      metadata = {}
    }

    console.log('Restaurant metadata:', restaurant.metadata)
    console.log('Parsed heroImage:', metadata.heroImage)
    
    return NextResponse.json({
      ...restaurant,
      heroImage: metadata.heroImage || null
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 })
  }
}

// PATCH - Update restaurant
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      address,
      zipCode,
      phone,
      website,
      email,
      categories,
      cuisineTypes,
      priceLevel,
      featured,
      verified,
      active,
      logoUrl,
      heroImage,
      photos
    } = body

    // Store heroImage in metadata field as JSON
    const currentRestaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { metadata: true }
    })

    let metadata: any = {}
    try {
      metadata = currentRestaurant?.metadata ? JSON.parse(currentRestaurant.metadata) : {}
    } catch (e) {
      console.error('Error parsing metadata:', e)
      metadata = {}
    }
    
    if (heroImage !== undefined) {
      // Only save heroImage if it's a non-empty string
      // This prevents saving empty strings when upload fails
      if (heroImage && heroImage.trim() !== '') {
        metadata.heroImage = heroImage
        console.log('Setting heroImage in metadata:', heroImage)
      } else if (heroImage === '' || heroImage === null) {
        // Explicitly remove heroImage if empty string or null
        delete metadata.heroImage
        console.log('Removing heroImage from metadata (empty value provided)')
      }
    }

    const metadataString = JSON.stringify(metadata)
    console.log('Saving metadata string:', metadataString)
    
    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(zipCode !== undefined && { zipCode }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(categories !== undefined && { categories }),
        ...(cuisineTypes !== undefined && { cuisineTypes }),
        ...(priceLevel !== undefined && { priceLevel }),
        ...(featured !== undefined && { featured }),
        ...(verified !== undefined && { verified }),
        ...(active !== undefined && { active }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(photos !== undefined && { photos }),
        metadata: metadataString,
        updatedAt: new Date()
      }
    })

    console.log('Restaurant updated, metadata field:', restaurant.metadata)

    // Log the change
    await prisma.auditLog.create({
      data: {
        entity: 'Restaurant',
        entityId: params.id,
        action: 'UPDATE',
        userId: user.id,
        changes: JSON.stringify({ before: {}, after: body }),
        metadata: JSON.stringify({ userEmail: user.email })
      }
    })

    // Return with parsed heroImage for verification
    const savedMetadata = restaurant.metadata ? JSON.parse(restaurant.metadata) : {}
    return NextResponse.json({ 
      success: true, 
      restaurant: {
        ...restaurant,
        heroImage: savedMetadata.heroImage || null
      }
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}
