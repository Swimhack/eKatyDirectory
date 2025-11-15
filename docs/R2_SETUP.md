# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for image uploads in production.

## Why R2?

- **Free tier**: 10GB storage, 1 million Class A operations/month
- **Fast**: Global CDN
- **S3-compatible**: Easy to integrate
- **No egress fees**: Unlike AWS S3

## Setup Steps

### 1. Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for a free account
3. Verify your email

### 2. Create R2 Bucket

1. In Cloudflare dashboard, go to **R2** in the left sidebar
2. Click **Create bucket**
3. Name it: `ekaty-uploads`
4. Click **Create bucket**

### 3. Enable Public Access (Optional but Recommended)

1. Go to your bucket settings
2. Click **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Click **Connect Domain** to add a custom domain (or use the R2.dev subdomain)
5. Note the public URL (e.g., `https://pub-xxxxx.r2.dev` or your custom domain)

### 4. Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Name it: `ekaty-upload-token`
4. Permissions: **Object Read & Write**
5. Click **Create API Token**
6. **IMPORTANT**: Copy these values (you won't see them again):
   - Access Key ID
   - Secret Access Key
   - Account ID (shown at the top)

### 5. Add Environment Variables to Fly.io

Run these commands in your terminal (replace with your actual values):

```bash
fly secrets set R2_ACCOUNT_ID="your-account-id"
fly secrets set R2_ACCESS_KEY_ID="your-access-key-id"
fly secrets set R2_SECRET_ACCESS_KEY="your-secret-access-key"
fly secrets set R2_BUCKET_NAME="ekaty-uploads"
fly secrets set R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### 6. Deploy

```bash
fly deploy
```

## Testing

1. Go to your admin panel: https://ekaty.fly.dev/admin/restaurants
2. Edit a restaurant
3. Try uploading an image
4. It should now upload to R2 successfully!

## Troubleshooting

### Check if R2 is configured:
```bash
fly ssh console
echo $R2_ACCOUNT_ID
```

### View logs:
```bash
fly logs
```

### Common issues:

1. **"R2 credentials not configured"**: Make sure all environment variables are set
2. **"Access Denied"**: Check that your API token has Read & Write permissions
3. **"Bucket not found"**: Verify the bucket name matches exactly

## Cost Estimate

With the free tier:
- Storage: 10GB (enough for ~10,000 restaurant images)
- Operations: 1M/month (plenty for a growing site)
- Bandwidth: Unlimited (no egress fees!)

You'll likely stay within the free tier for a long time.
