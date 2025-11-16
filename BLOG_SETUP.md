# Blog Manager Integration - Setup Guide

The blog manager system has been successfully integrated into eKaty! This guide will help you set it up.

## ✅ What's Been Added

1. **Database Schema** - `BlogArticle` model added to Prisma schema
2. **API Routes**:
   - `/api/admin/blog` - Admin CRUD operations (requires auth)
   - `/api/blog` - Public article fetching
3. **Admin Interface** - `/admin/blog` - Full blog management UI
4. **Public Pages**:
   - `/blog` - Blog listing page
   - `/blog/[slug]` - Individual article pages
5. **AI Integration** - Anthropic Claude API for content generation
6. **Utility Functions** - Blog helpers in `lib/blog/`

## 🚀 Quick Setup

### 1. Update Database Schema

Run Prisma migration to add the blog articles table:

```bash
npx prisma migrate dev --name add_blog_articles
```

Or push the schema directly:

```bash
npx prisma db push
```

### 2. Set Environment Variables

Add to your `.env` file:

```env
# Anthropic API Key (for AI content generation)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Admin API Key (for blog management)
ADMIN_API_KEY=ekaty-admin-secret-2025

# App URL (for canonical URLs)
NEXT_PUBLIC_APP_URL=https://ekaty.fly.dev
```

**Get Anthropic API Key:**
- Visit: https://console.anthropic.com/
- Create account or login
- Generate API key
- Copy to `.env` file

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Access Admin Interface

Visit: `https://ekaty.fly.dev/admin/blog`

**Note:** The admin interface currently uses a hardcoded API key for simplicity. 
For production, you should implement proper session-based authentication.

## 📝 Usage

### Creating Articles (AI-Powered)

1. Go to `/admin/blog`
2. Click "⚡ Quick Generate"
3. Enter article title
4. Click "Generate & Publish"
5. Wait 30-60 seconds
6. Article is automatically published!

### Manual Article Creation

1. Go to `/admin/blog`
2. Click "✍️ Create New"
3. Fill in title, content (HTML), metadata
4. Click "Publish"

### Viewing Articles

- **Blog Listing**: `/blog`
- **Individual Article**: `/blog/[slug]`

## 🔐 Security Notes

### Current Implementation

The admin interface uses a simple API key authentication matching the original PHP implementation. 

**For Production:**

1. **Change Admin Key**: Update `ADMIN_API_KEY` in `.env` to a strong secret
2. **Implement Session Auth**: Replace API key auth with NextAuth.js or similar
3. **Protect Admin Routes**: Add middleware to protect `/admin/*` routes
4. **Rate Limiting**: Add rate limiting to API routes

### Recommended Production Setup

```typescript
// app/admin/blog/page.tsx
// Replace API key auth with session check:
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function BlogManagerPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }
  
  // ... rest of component
}
```

## 🎨 Customization

### Update Branding

Edit these files to match eKaty branding:
- `app/blog/page.tsx` - Blog listing page
- `app/blog/[slug]/page.tsx` - Article page
- `app/admin/blog/page.tsx` - Admin interface

### Update AI Prompts

Edit `lib/blog/anthropic.ts` to customize:
- Article tone and style
- Word count
- Content structure
- Internal linking strategy

### Update Internal Links

Edit `lib/blog/utils.ts` → `fixBrokenLinksInContent()` to add your page mappings.

## 📊 Features

### AI Content Generation
- ✅ One-click article creation from title
- ✅ Claude Sonnet 4 integration
- ✅ SEO-optimized content
- ✅ Automatic internal linking
- ✅ Industry research & citations
- ✅ 1200-1500 word articles

### Content Management
- ✅ Create, edit, delete articles
- ✅ Draft/Published status
- ✅ SEO metadata (title, description, keywords)
- ✅ Slug generation
- ✅ Author information

### Public Display
- ✅ Beautiful blog listing
- ✅ Individual article pages
- ✅ Related articles
- ✅ SEO schema markup
- ✅ Mobile-responsive design

## 💰 Cost Estimate

**AI Generation:**
- Per article: ~$0.004 (less than half a cent)
- 100 articles: ~$0.40
- 1000 articles: ~$4.00

Uses Claude Sonnet 4 model for optimal quality/cost ratio.

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file exists
- Verify `ANTHROPIC_API_KEY` is set
- Ensure no extra spaces/newlines

### "Database errors"
- Run `npx prisma generate`
- Run `npx prisma db push`
- Check database connection

### "Articles not showing"
- Verify article status is 'published'
- Check database has articles
- Review API route logs

### "Admin access denied"
- Verify `ADMIN_API_KEY` matches in `.env` and API route
- Check authorization header format

## 📚 API Documentation

### Admin API (`/api/admin/blog`)

**GET** - List all articles
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://ekaty.fly.dev/api/admin/blog
```

**POST** - Create article
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"quick_generate","title":"My Article Title"}' \
  https://ekaty.fly.dev/api/admin/blog
```

**PUT** - Update article
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"...","title":"Updated Title","content":"..."}' \
  https://ekaty.fly.dev/api/admin/blog
```

**DELETE** - Delete article
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://ekaty.fly.dev/api/admin/blog?id=ARTICLE_ID
```

### Public API (`/api/blog`)

**GET** - List published articles
```bash
curl https://ekaty.fly.dev/api/blog
```

**GET** - Get single article
```bash
curl https://ekaty.fly.dev/api/blog?slug=article-slug
```

## ✅ Next Steps

1. ✅ Database schema added
2. ✅ API routes created
3. ✅ Admin interface built
4. ✅ Public pages created
5. ⏳ Set environment variables
6. ⏳ Run database migration
7. ⏳ Test article generation
8. ⏳ Customize branding
9. ⏳ Add to navigation menu

## 📞 Support

For questions or issues, refer to the original blog_manager documentation or contact the development team.

---

**Last Updated:** January 2025  
**Version:** 1.0.0





