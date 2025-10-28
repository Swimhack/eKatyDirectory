# Email Setup Guide

The contact form is now configured to send emails to **James@eKaty.com** using Resend.

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email domain (ekaty.com) or use Resend's test domain for testing
3. Create an API key in the dashboard
4. Copy the API key

### 2. Configure Environment Variables

#### For Fly.io Production:
```bash
fly secrets set RESEND_API_KEY="your_resend_api_key_here"
```

#### For Local Development:
Add to your `.env.local` file:
```
RESEND_API_KEY="your_resend_api_key_here"
```

### 3. Domain Verification (For Production)

To send emails from `noreply@ekaty.com`, you need to verify the domain in Resend:

1. Go to Resend Dashboard → Domains
2. Add domain: `ekaty.com`
3. Add the DNS records provided by Resend to your domain registrar
4. Wait for verification (usually takes a few minutes)

**Until domain is verified**, emails will be sent from Resend's test domain.

## Email Features

### Notification Email
- **Recipient**: James@eKaty.com
- **Reply-To**: User's email (so you can reply directly)
- **Subject**: Includes emoji and type (🚀 for advertising, 📧 for general)
- **Content**: All form data including name, email, phone, subject, message

### Confirmation Email
- **Recipient**: User who submitted the form
- **Content**: Thank you message with 24-48 hour response time
- **Branding**: Includes eKaty contact info and links

## Testing

To test locally:
1. Set `RESEND_API_KEY` in `.env.local`
2. Run `npm run dev`
3. Submit a contact form at `http://localhost:3000/contact`
4. Check console for email send confirmation
5. Check James@eKaty.com inbox

## Troubleshooting

If emails aren't sending:
- Verify `RESEND_API_KEY` is set correctly
- Check Fly.io logs: `fly logs`
- Check Resend dashboard for delivery status
- Ensure domain is verified (for production emails from @ekaty.com)
