# How to Add Blog Articles to eKaty

## 🚀 Quick Start Guide

### Method 1: AI-Powered Quick Generation (Recommended)

**Best for:** Fast, professional articles with minimal effort

1. **Access Admin Interface**
   - Visit: `https://ekaty.fly.dev/admin/blog`
   - Or locally: `http://localhost:3000/admin/blog`

2. **Click "⚡ Quick Generate"**
   - Located in the navigation tabs at the top

3. **Enter Article Title**
   - Example: "Best Family-Friendly Restaurants in Katy, Texas"
   - Example: "Kid-Friendly Menus: Where to Dine with Picky Eaters"
   - Example: "Budget-Friendly Family Dining in Katy"

4. **Click "⚡ Generate & Publish"**
   - Wait 30-60 seconds
   - AI will create a complete 1200-1500 word article
   - Article is automatically published!

**That's it!** Your article is live at `/blog/[article-slug]`

---

### Method 2: Manual Article Creation

**Best for:** Custom content, specific formatting, or when you have pre-written content

1. **Access Admin Interface**
   - Visit: `https://ekaty.fly.dev/admin/blog`

2. **Click "✍️ Create New"**
   - Located in the navigation tabs

3. **Fill in the Form:**
   - **Title*** (required): Your article title
   - **Content*** (required): HTML content (use `<h2>`, `<p>`, `<ul>`, etc.)
   - **Meta Description**: 150-160 characters for SEO
   - **Keywords**: Comma-separated (e.g., "Katy Texas, family dining, restaurants")
   - **Author Name**: Defaults to "James Strickland"
   - **Status**: Choose "draft" or "published"

4. **Click "🚀 Publish Article"**
   - Article is saved and published immediately

---

## 📝 Step-by-Step: AI Generation

### Example: Creating a Family Dining Article

1. Go to `https://ekaty.fly.dev/admin/blog`
2. Click the **"⚡ Quick Generate"** tab
3. Enter title: `"Best Family-Friendly Restaurants in Katy, Texas"`
4. Click **"⚡ Generate & Publish Article"**
5. Wait 30-60 seconds (you'll see "⏳ Generating..." message)
6. Success! Article is published and visible at `/blog/best-family-friendly-restaurants-in-katy-texas`

### What AI Generates:
- ✅ Complete 1200-1500 word article
- ✅ SEO-optimized title
- ✅ Meta description (150-160 characters)
- ✅ Keywords (including "Katy Texas", "family dining")
- ✅ HTML formatting with headings, paragraphs, lists
- ✅ Internal links to eKaty pages
- ✅ Family-focused, practical content
- ✅ Local Katy restaurant examples

---

## ✏️ Step-by-Step: Manual Creation

### Example: Creating a Custom Article

1. Go to `https://ekaty.fly.dev/admin/blog`
2. Click the **"✍️ Create New"** tab
3. Fill in:
   ```
   Title: "Our Favorite Weekend Brunch Spots"
   
   Content: 
   <h2>Why Weekend Brunch Matters for Families</h2>
   <p>Weekend brunch has become a beloved tradition for Katy families...</p>
   <h3>Top Brunch Spots in Katy</h3>
   <ul>
     <li>Restaurant Name - Great for kids, outdoor seating</li>
     <li>Another Restaurant - Bottomless mimosas for parents</li>
   </ul>
   
   Meta Description: Discover the best weekend brunch spots in Katy, Texas perfect for families. From kid-friendly menus to outdoor patios.
   
   Keywords: Katy Texas, brunch, family dining, weekend dining
   ```
4. Set Status to **"published"**
5. Click **"🚀 Publish Article"**

---

## 🎯 Suggested Article Titles for Families

### Family-Friendly Topics:
- "Best Family-Friendly Restaurants in Katy, Texas"
- "Kid-Friendly Menus: Where to Dine with Picky Eaters"
- "Budget-Friendly Family Dining in Katy"
- "Weekend Brunch Spots Perfect for Families"
- "Birthday Party Restaurants in Katy"
- "Outdoor Dining: Patio Restaurants for Families"
- "Quick Bites: Fast-Casual Spots for Busy Families"
- "Date Night Spots with Kid-Friendly Options"
- "Healthy Options: Nutritious Family Dining in Katy"
- "Holiday Dining: Where to Celebrate with Family"

### Seasonal Topics:
- "Summer Dining: Patio Restaurants for Family Gatherings"
- "Holiday Dining: Where to Celebrate with Family in Katy"
- "Back-to-School: Quick Family Dinner Spots"
- "Valentine's Day: Family-Friendly Romantic Restaurants"

---

## 🔧 Editing Existing Articles

1. Go to `https://ekaty.fly.dev/admin/blog`
2. Find your article in the list
3. Click **"✏️ Edit"** button
4. Make your changes
5. Click **"💾 Update"**

---

## 🗑️ Deleting Articles

1. Go to `https://ekaty.fly.dev/admin/blog`
2. Find your article in the list
3. Click **"🗑️ Delete"** button
4. Confirm deletion

---

## 📍 Viewing Your Articles

### Public View:
- **Blog Listing**: `https://ekaty.fly.dev/blog`
- **Individual Article**: `https://ekaty.fly.dev/blog/[article-slug]`

### Admin View:
- **All Articles**: `https://ekaty.fly.dev/admin/blog`
- Click **"👁️ View"** to see the public version

---

## 💡 Tips for Great Articles

### For AI Generation:
- Use specific, descriptive titles
- Include "Katy, Texas" or "family" in titles for better SEO
- Examples:
  - ✅ "Best Family-Friendly Restaurants in Katy, Texas"
  - ✅ "Kid-Friendly Menus: Where to Dine with Picky Eaters in Katy"
  - ❌ "Restaurants" (too vague)
  - ❌ "Food" (not specific enough)

### For Manual Creation:
- Use proper HTML formatting:
  - `<h2>` for main sections
  - `<h3>` for subsections
  - `<p>` for paragraphs
  - `<ul>` and `<li>` for lists
  - `<strong>` for emphasis
- Include internal links: `/discover`, `/categories`, `/contact`
- Keep meta descriptions between 150-160 characters
- Use relevant keywords naturally

---

## ⚙️ Configuration

### Setting Up AI Generation (One-Time Setup)

If AI generation isn't working, you need to set the Anthropic API key:

```bash
# On Fly.io production
fly secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here -a ekaty

# Or locally, add to .env file:
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Get API Key:** https://console.anthropic.com/

---

## 🎨 Article Best Practices

### Title Format:
- 60 characters or less
- Include location: "in Katy, Texas"
- Include target audience: "for Families"
- Be specific: "Best [Category] Restaurants"

### Content Structure:
1. **Opening Hook**: Relatable family scenario
2. **The Challenge**: Address common concerns
3. **Practical Solutions**: Actionable tips
4. **Local Examples**: Specific Katy restaurants
5. **Real Family Stories**: Relatable experiences
6. **Pro Tips**: Insider knowledge
7. **Call-to-Action**: Invite exploration

### SEO Keywords:
Always include:
- "Katy Texas" or "Katy, Texas"
- "family dining" or "family-friendly"
- Topic-specific terms

Example: `"Katy Texas, family dining, family-friendly restaurants, kid-friendly menus, Katy restaurants"`

---

## 📊 Managing Articles

### View All Articles:
- Go to `/admin/blog`
- See list with title, status, published date
- Use "👁️ View" to preview
- Use "✏️ Edit" to modify
- Use "🗑️ Delete" to remove

### Article Status:
- **Published**: Visible on public blog
- **Draft**: Hidden from public, can be edited

---

## 🐛 Troubleshooting

### "AI Generation Failed"
- Check if `ANTHROPIC_API_KEY` is set
- Verify API key format (should start with `sk-ant-`)
- Check browser console for errors

### "Article Not Showing"
- Verify status is "published" (not "draft")
- Check article was saved successfully
- Clear browser cache

### "Can't Access Admin"
- Verify you're using the correct URL
- Check admin interface is accessible
- Review browser console for errors

---

## 📞 Need Help?

**Admin Interface:** `https://ekaty.fly.dev/admin/blog`  
**Public Blog:** `https://ekaty.fly.dev/blog`

**Quick Links:**
- Create AI Article: `/admin/blog` → "⚡ Quick Generate"
- Create Manual Article: `/admin/blog` → "✍️ Create New"
- View All Articles: `/admin/blog` → "📋 All Articles"
- View Public Blog: `/blog`

---

**Happy Blogging!** 📝👨‍👩‍👧‍👦





