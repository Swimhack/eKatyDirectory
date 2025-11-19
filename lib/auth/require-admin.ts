import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Middleware to require admin authentication for API routes
 * Checks both session authentication and admin role
 * @param request Next.js request object
 * @returns null if authorized, NextResponse with error if unauthorized/forbidden
 */
export async function requireAdmin(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has admin role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (userError) {
    console.error('Error fetching user role:', userError)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - admin access required' },
      { status: 403 }
    )
  }

  // User is authenticated and has admin role
  return null
}

/**
 * Alternative implementation checking user metadata from auth.users
 * Use this if role is stored in raw_user_meta_data
 */
export async function requireAdminMetadata(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check role from user metadata
  const role = session.user.user_metadata?.role || session.user.app_metadata?.role

  if (role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - admin access required' },
      { status: 403 }
    )
  }

  return null
}
