import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
    
    if (!code) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_failed`)
    }

    const { redirectTo } = state ? JSON.parse(decodeURIComponent(state)) : { redirectTo: '/admin/dashboard' }
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${baseUrl}/api/auth/google/callback`

    if (!googleClientId || !googleClientSecret) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_not_configured`)
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=user_info_failed`)
    }

    const googleUser = await userInfoResponse.json()

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() }
    })

    if (!user) {
      // Create new user with social auth
      // Generate a random password hash (won't be used for social auth users)
      const bcrypt = require('bcrypt')
      const randomPassword = Math.random().toString(36)
      const passwordHash = await bcrypt.hash(randomPassword, 10)
      
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          name: googleUser.name || googleUser.email.split('@')[0],
          passwordHash,
          role: 'USER', // Default role, can be upgraded to ADMIN/EDITOR manually
        }
      })
    }

    // Check if user has admin/editor role for admin access
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=insufficient_permissions`)
    }

    // Create session
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    const cookieStore = await cookies()
    
    cookieStore.set('ekaty_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    cookieStore.set('ekaty_user_id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    cookieStore.set('ekaty_user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    const finalRedirect = redirectTo.startsWith('http') ? redirectTo : `${baseUrl}${redirectTo}`
    return NextResponse.redirect(finalRedirect)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_error`)
  }
}

