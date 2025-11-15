import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// PATCH - Update suggestion status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status, adminNotes, applyChanges } = body

    if (!status || !['approved', 'rejected', 'duplicate'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const suggestion = await prisma.suggestion.findUnique({
      where: { id }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    // If approved and applyChanges is true, update the restaurant
    if (status === 'approved' && applyChanges && suggestion.restaurantId) {
      try {
        const updateData: any = {}
        
        if (suggestion.field) {
          updateData[suggestion.field] = suggestion.suggestedValue
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.restaurant.update({
            where: { id: suggestion.restaurantId },
            data: updateData
          })
        }
      } catch (error) {
        console.error('Error applying suggestion changes:', error)
      }
    }

    // Update suggestion
    const updated = await prisma.suggestion.update({
      where: { id },
      data: {
        status,
        adminNotes,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        appliedAt: status === 'approved' && applyChanges ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      suggestion: updated
    })
  } catch (error) {
    console.error('Error updating suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to update suggestion' },
      { status: 500 }
    )
  }
}

// DELETE - Delete suggestion (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await prisma.suggestion.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted'
    })
  } catch (error) {
    console.error('Error deleting suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to delete suggestion' },
      { status: 500 }
    )
  }
}
