# Google OAuth Setup Guide

## Quick Setup (5 minutes)

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **eKaty**
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **eKaty**
   - Authorized JavaScript origins:
     - `https://ekaty.com`
     - `https://ekaty.fly.dev`
     - `http://localhost:3000` (for development)
   - Authorized redirect URIs:
     - `https://ekaty.com/api/auth/google/callback`
     - `https://ekaty.fly.dev/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 2. Add to Fly.io Secrets

```bash
fly secrets set GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
fly secrets set GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 3. Deploy

```bash
fly deploy
```

### 4. Test

1. Go to https://ekaty.fly.dev/auth/signin
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected back and signed in

## Troubleshooting

### "Google OAuth not configured" Error
- Make sure you've set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets in Fly.io
- Verify with: `fly secrets list`

### "redirect_uri_mismatch" Error
- Make sure all redirect URIs are added to Google Cloud Console
- The redirect URI must be exactly: `https://ekaty.fly.dev/api/auth/google/callback`

### "Access blocked" Error
- Your OAuth consent screen might be in testing mode
- Add your email as a test user, or publish the app

## Current Status

The Google OAuth route is already implemented and working. You just need to:
1. Get credentials from Google Cloud Console
2. Add them as Fly.io secrets
3. Deploy

That's it!
