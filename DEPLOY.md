# Deployment Instructions

## Before Deploying

### 1. Set up Resend API Key

You need to get a Resend API key and set it in Fly.io:

```powershell
# Option 1: Set the secret directly (replace with your actual key)
fly secrets set RESEND_API_KEY="re_your_api_key_here"

# Option 2: Set it interactively
fly secrets set RESEND_API_KEY
# Then paste your key when prompted
```

### 2. Get Your Resend API Key

1. Go to https://resend.com and sign up/login
2. Create an API key in the dashboard
3. Copy the API key (starts with "re_")

### 3. (Optional) Verify Domain

For production emails from @ekaty.com:
1. Go to Resend Dashboard → Domains
2. Add domain: `ekaty.com`
3. Add the DNS records to your domain registrar
4. Wait for verification

**Note**: You can still test without domain verification - emails will come from Resend's test domain.

## Deploy to Fly.io

Once the RESEND_API_KEY is set, deploy:

```powershell
fly deploy
```

## Verify Deployment

1. Check deployment status:
```powershell
fly status
```

2. View logs:
```powershell
fly logs
```

3. Test the contact form:
   - Visit https://ekaty.fly.dev/contact
   - Submit a test message
   - Check James@eKaty.com for the email

## Quick Deploy Command

If you've already set up everything:

```powershell
# Build and deploy
fly deploy

# Check status
fly status

# View logs
fly logs
```

## Troubleshooting

### Email not sending?
- Check if RESEND_API_KEY is set: `fly secrets list`
- View logs for errors: `fly logs`
- Verify API key in Resend dashboard

### Deployment failed?
- Check build logs: `fly logs`
- Ensure Docker is running
- Try: `fly deploy --local-only`

### App not starting?
- Check machine status: `fly status`
- Restart machine: `fly machine restart <machine-id>`
- View detailed logs: `fly logs -a ekaty`
