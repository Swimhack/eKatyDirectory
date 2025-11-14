# 📝 Blog Manager System - Complete Package

**Version:** 1.0  
**Created:** November 2025  
**Author:** James Strickland / Strickland Technology  
**Powered by:** Claude AI (Anthropic)

---

## 🎯 Overview

This is a complete, portable blog management system with AI-powered content generation. Easily migrate to any website by following the installation steps below.

---

## 📦 Package Contents

### Core Files:
1. **blog_manager.php** - Main admin interface for creating/managing articles
2. **fix_blog_links.php** - Utility to fix broken internal links in all articles
3. **blog_functions.php** - Helper functions for blog operations
4. **blog.php** - Public-facing blog listing page
5. **article.php** - Individual article display page
6. **dbconnect_template.php** - Database connection template
7. **setup_blog_database.sql** - Database table creation script
8. **.env.example** - Environment variables template

### Documentation:
- **README.md** - This file
- **INSTALLATION.md** - Step-by-step installation guide
- **MIGRATION_GUIDE.md** - How to migrate to ekaty.com

---

## ✨ Features

### 🤖 AI-Powered Content Generation
- **One-click article creation** from just a title
- **Claude AI integration** for professional, SEO-optimized content
- **Automatic internal linking** to your website pages
- **Industry research & citations** from major tech companies
- **1200-1500 word articles** with proper structure

### 🔗 Smart Link Management
- **Automatic link validation** - ensures all links point to real pages
- **Bulk link fixing** - repair broken links in all existing articles
- **Placeholder replacement** - converts `/services/web-design` to `website_design.php`

### 📊 Content Management
- **Create, edit, delete** articles
- **Draft/Published status** control
- **SEO metadata** (title, description, keywords)
- **Slug generation** for clean URLs
- **Author information** tracking

### 🎨 User Interface
- **Modern, responsive design**
- **Color-coded status indicators**
- **Quick-action buttons**
- **Suggested topic templates**
- **Real-time preview**

---

## 🚀 Quick Start

### Prerequisites:
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Anthropic API key (for AI generation)
- Web server (Apache/Nginx)

### Installation (3 Steps):

1. **Copy files to your website:**
   ```bash
   cp -r blog_manager/* /path/to/your/website/
   ```

2. **Create database table:**
   ```bash
   mysql -u username -p database_name < setup_blog_database.sql
   ```

3. **Configure settings:**
   - Copy `.env.example` to `.env`
   - Add your database credentials
   - Add your Anthropic API key

**Done!** Access at: `https://yoursite.com/blog_manager.php?admin_key=strickland2024`

---

## 🔧 Configuration

### Database Connection (dbconnect.php):
```php
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
```

### Environment Variables (.env):
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Internal Links (blog_manager.php):
Update the link validation function with your actual page URLs:
```php
$valid_links = [
    'web-design' => 'your_web_design_page.php',
    'seo' => 'your_seo_page.php',
    // ... etc
];
```

---

## 📖 Usage Guide

### Creating Articles (AI-Powered):
1. Go to blog_manager.php
2. Enter article title
3. Click "Generate & Publish"
4. Wait 30-60 seconds
5. Article automatically published!

### Manual Article Creation:
1. Click "Create New Article"
2. Fill in title, content, metadata
3. Use HTML tags for formatting
4. Click "Save Article"

### Fixing Broken Links:
1. Click "Fix broken links" in manager
2. Review results
3. All articles updated automatically

### Displaying Articles:
- **Blog listing:** `blog.php` - shows all articles
- **Individual article:** `article.php?id=123` or `article-slug-name.php`

---

## 🔐 Security

### Admin Access:
- Default key: `?admin_key=strickland2024`
- **Change this immediately** in production!
- Session-based authentication after first login

### API Key Protection:
- Store in `.env` file (not in code)
- Never commit `.env` to version control
- Add `.env` to `.gitignore`

### Database:
- Use prepared statements (already implemented)
- Sanitize all user input (already implemented)
- Regular backups recommended

---

## 🎨 Customization

### Styling:
- Blog listing: Edit CSS in `blog.php`
- Article page: Edit CSS in `article.php`
- Admin interface: Edit inline styles in `blog_manager.php`

### AI Generation:
Customize prompts in `blog_manager.php` function `generateArticleFromTitle()`:
- Adjust tone/style
- Change word count
- Modify structure
- Add custom instructions

### Link Validation:
Add your site's pages to `fixBrokenLinksInContent()` function

---

## 📊 Database Schema

### Table: `blog_articles`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- title (VARCHAR 255)
- content (LONGTEXT)
- meta_description (TEXT)
- keywords (VARCHAR 500)
- slug (VARCHAR 255)
- author_name (VARCHAR 100)
- contact_email (VARCHAR 100)
- phone_number (VARCHAR 20)
- published_date (DATETIME)
- status (ENUM: 'draft', 'published')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file exists
- Verify `ANTHROPIC_API_KEY` is set
- Ensure no extra spaces/newlines

### "Database connection failed"
- Verify credentials in `dbconnect.php`
- Check MySQL is running
- Confirm database exists

### "Broken links in articles"
- Run `fix_blog_links.php`
- Update link mappings for your site
- Check page URLs are correct

### "Articles not showing"
- Verify database table exists
- Check article status is 'published'
- Review `blog.php` database query

---

## 💰 Cost Estimate

### AI Generation:
- **Per article:** ~$0.004 (less than half a cent)
- **100 articles:** ~$0.40
- **1000 articles:** ~$4.00

Uses Claude Sonnet 4 model for optimal quality/cost ratio.

---

## 🔄 Migration to ekaty.com

See **MIGRATION_GUIDE.md** for detailed steps.

Quick version:
1. Copy entire `blog_manager` folder to ekaty.com
2. Update `dbconnect.php` with ekaty.com database
3. Update internal links in `blog_manager.php`
4. Import database table
5. Test and go live!

---

## 📞 Support

**Created by:** James Strickland  
**Company:** Strickland Technology  
**Website:** stricklandtechnology.net  
**Phone:** 713-444-6732  
**Email:** james@stricklandtechnology.net

---

## 📝 License

Proprietary - Strickland Technology  
For use on Strickland Technology projects only.

---

## 🎉 Credits

- **AI Model:** Claude Sonnet 4 (Anthropic)
- **Development:** James Strickland
- **Design:** Strickland Technology
- **Testing:** Houston business community

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0
