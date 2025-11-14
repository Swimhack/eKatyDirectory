# 🚀 Quick Installation Guide

**Time Required:** 10 minutes  
**Difficulty:** Easy

---

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] PHP 7.4 or higher
- [ ] MySQL 5.7 or higher  
- [ ] Web server (Apache/Nginx)
- [ ] Anthropic API key ([Get one here](https://console.anthropic.com/))
- [ ] Database credentials

---

## 📦 Installation Steps

### 1. Copy Files (1 minute)

Copy the entire `blog_manager` folder to your website:

```bash
# Example for ekaty.com
cp -r blog_manager/* /path/to/ekaty.com/
```

Or use FTP/File Manager to upload all files.

---

### 2. Create Database Table (2 minutes)

**Option A: phpMyAdmin**
1. Login to phpMyAdmin
2. Select your database
3. Click "Import"
4. Choose `setup_blog_database.sql`
5. Click "Go"

**Option B: Command Line**
```bash
mysql -u username -p database_name < setup_blog_database.sql
```

---

### 3. Configure Database (2 minutes)

Create `dbconnect.php` in your website root:

```bash
# Copy template
cp blog_manager/dbconnect_template.php dbconnect.php

# Edit with your credentials
nano dbconnect.php  # or use your favorite editor
```

Update these lines:
```php
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
```

---

### 4. Add API Key (2 minutes)

Create `.env` file in your website root:

```bash
# Copy template
cp blog_manager/.env.example .env

# Edit with your API key
nano .env
```

Add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Get API Key:** https://console.anthropic.com/

---

### 5. Test Installation (3 minutes)

Visit your blog manager:
```
https://yoursite.com/blog_manager/blog_manager.php?admin_key=strickland2024
```

**You should see:**
- ✅ Admin interface loads
- ✅ No database errors
- ✅ "Create Article" button visible

**Test article generation:**
1. Enter test title: "Welcome to My Blog"
2. Click "Generate & Publish"
3. Wait 30-60 seconds
4. Should see success message

**View your blog:**
```
https://yoursite.com/blog.php
```

---

## 🎨 Optional: Customize

### Update Internal Links
Edit `blog_manager/blog_manager.php` around line 410:
```php
$link_replacements = [
    'web-design' => 'your-web-design-page.php',
    'seo' => 'your-seo-page.php',
    // Add your actual pages
];
```

### Change Admin Key
In `blog_manager.php` line 16:
```php
if (isset($_GET['admin_key']) && $_GET['admin_key'] === 'your-new-key') {
```

### Add to Navigation
Edit your `navigation.php`:
```php
<a href="blog.php">Blog</a>
```

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `dbconnect.php` credentials
- Verify database exists
- Test MySQL connection

### "API key not configured"
- Verify `.env` file exists
- Check API key format (starts with `sk-ant-`)
- No extra spaces or quotes

### "Permission denied"
```bash
chmod 755 blog_manager/
chmod 644 blog_manager/*.php
```

---

## ✅ Installation Complete!

You're ready to start creating content!

**Next Steps:**
1. Generate your first article
2. Customize styling
3. Add blog to navigation
4. Share with the world!

**Need Help?**  
James Strickland: 713-444-6732  
james@stricklandtechnology.net

---

**Estimated Costs:**
- Setup: Free
- Per article: $0.004 (less than 1 cent)
- 100 articles/month: $0.40

Happy blogging! 🎉
