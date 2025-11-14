import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirect') || '/admin/dashboard'
  
  const githubClientId = process.env.GITHUB_CLIENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
  
  if (!githubClientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    )
  }

  const redirectUri = `${baseUrl}/api/auth/github/callback`
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(githubClientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=user:email&` +
    `state=${encodeURIComponent(JSON.stringify({ redirectTo }))}`

  return NextResponse.redirect(authUrl)
}

