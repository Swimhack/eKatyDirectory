import { NextRequest, NextResponse } from 'next/server'
import { seedRestaurants } from '@/lib/scripts/seed-restaurants'

export async function POST(request: NextRequest) {
  try {
    // Simple security check - in production you'd want proper admin authentication
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    
    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin token' },
        { status: 401 }
      )
    }

    console.log('🔧 Admin seeding request received')
    
    // Execute the seeding process
    await seedRestaurants()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Restaurant seeding completed successfully! Check server logs for details.'
    })
    
  } catch (error) {
    console.error('💥 Error during admin seeding:', error)
    return NextResponse.json(
      { 
        error: 'Seeding failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Admin seeding endpoint',
    usage: 'Send POST request with Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY} header',
    status: 'ready'
  })
}