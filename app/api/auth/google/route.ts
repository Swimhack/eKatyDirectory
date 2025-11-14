import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirect') || '/admin/dashboard'
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
  
  if (!googleClientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    )
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`
  const scope = 'openid email profile'
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(googleClientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=online&` +
    `prompt=select_account&` +
    `state=${encodeURIComponent(JSON.stringify({ redirectTo }))}`

  return NextResponse.redirect(authUrl)
}

