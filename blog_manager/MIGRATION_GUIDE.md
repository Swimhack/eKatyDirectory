# 🚀 Migration Guide: Blog Manager to ekaty.com

**Target:** C:\STRICKLAND\Strickland Technology Marketing\ekaty.com-2025\blog_manager  
**Estimated Time:** 15-20 minutes  
**Difficulty:** Easy

---

## 📋 Pre-Migration Checklist

- [ ] Backup current ekaty.com database
- [ ] Have ekaty.com database credentials ready
- [ ] Have Anthropic API key ready
- [ ] Verify PHP version (7.4+)
- [ ] Test database connection

---

## 🎯 Step-by-Step Migration

### Step 1: Copy Files (2 minutes)

```powershell
# From Windows PowerShell
Copy-Item "C:\STRICKLAND\Strickland Technology Marketing\stricklandtechnology.net\blog_manager\*" `
          -Destination "C:\STRICKLAND\Strickland Technology Marketing\ekaty.com-2025\blog_manager\" `
          -Recurse -Force
```

**Files copied:**
- blog_manager.php
- fix_blog_links.php
- blog_functions.php
- blog.php
- article.php
- dbconnect_template.php
- setup_blog_database.sql
- .env.example
- README.md
- MIGRATION_GUIDE.md

---

### Step 2: Create Database Table (3 minutes)

**Option A: Using phpMyAdmin**
1. Open phpMyAdmin for ekaty.com database
2. Click "Import" tab
3. Choose `setup_blog_database.sql`
4. Click "Go"

**Option B: Using MySQL Command Line**
```bash
mysql -u your_username -p ekaty_database < setup_blog_database.sql
```

**Option C: Manual SQL**
Copy and paste the SQL from `setup_blog_database.sql` into your MySQL client.

---

### Step 3: Configure Database Connection (2 minutes)

Create `dbconnect.php` in ekaty.com root:

```php
<?php
$host = 'localhost';  // or your MySQL host
$db   = 'ekaty_database_name';
$user = 'ekaty_db_user';
$pass = 'your_password';
$charset = 'utf8';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$opt = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
$pdo = new PDO($dsn, $user, $pass, $opt);
?>
```

---

### Step 4: Configure Environment Variables (2 minutes)

Create `.env` file in ekaty.com root:

```bash
# Copy template
Copy-Item "blog_manager\.env.example" -Destination ".env"

# Edit .env and add:
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Get API Key:**
- Visit: https://console.anthropic.com/
- Create account or login
- Generate API key
- Copy to `.env` file

---

### Step 5: Update Internal Links (5 minutes)

Edit `blog_manager/blog_manager.php` - find the `fixBrokenLinksInContent()` function and update with ekaty.com pages:

```php
function fixBrokenLinksInContent($content) {
    $link_replacements = [
        // Update these to match ekaty.com pages
        '/services/web-design' => 'web-design.php',  // or whatever your pages are
        '/web-design' => 'web-design.php',
        'web-design' => 'web-design.php',
        
        '/services/seo' => 'seo-services.php',
        '/seo' => 'seo-services.php',
        'seo' => 'seo-services.php',
        
        '/contact' => 'contact.php',
        'contact' => 'contact.php',
        
        // Add all ekaty.com pages here
    ];
    
    // ... rest of function stays the same
}
```

Also update the AI prompt (around line 479):

```php
$user_prompt .= "- Include 2-3 internal links using ONLY these exact URLs:\n";
$user_prompt .= "  * web-design.php (for web design topics)\n";
$user_prompt .= "  * seo-services.php (for SEO topics)\n";
$user_prompt .= "  * marketing.php (for marketing topics)\n";
// ... update with actual ekaty.com pages
```

---

### Step 6: Update Navigation/Footer (3 minutes)

If ekaty.com has `navigation.php` and `footer.php`, add blog link:

**navigation.php:**
```php
<a href="blog.php">Blog</a>
```

**footer.php:**
```php
<a href="blog.php">Blog</a> | 
```

---

### Step 7: Test Everything (5 minutes)

1. **Test Database Connection:**
   ```
   http://ekaty.com/blog_manager/blog_manager.php?admin_key=strickland2024
   ```
   Should see admin interface

2. **Test Article Generation:**
   - Enter a test title
   - Click "Generate & Publish"
   - Wait 30-60 seconds
   - Should see success message

3. **Test Blog Display:**
   ```
   http://ekaty.com/blog.php
   ```
   Should show your test article

4. **Test Article Page:**
   Click article title - should display full article

5. **Test Link Fixer:**
   ```
   http://ekaty.com/blog_manager/fix_blog_links.php?admin_key=strickland2024
   ```
   Should scan and fix any broken links

---

## 🔐 Security Hardening

### Change Admin Key:
In `blog_manager.php`, find and change:
```php
if (isset($_GET['admin_key']) && $_GET['admin_key'] === 'strickland2024') {
```
To:
```php
if (isset($_GET['admin_key']) && $_GET['admin_key'] === 'your-new-secret-key-here') {
```

### Protect .env File:
Add to `.htaccess`:
```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### Add to .gitignore:
```
.env
dbconnect.php
```

---

## 📊 Migrating Existing Articles (Optional)

If you want to copy articles from stricklandtechnology.net:

```sql
-- Export from stricklandtechnology.net
mysqldump -u user -p database_name blog_articles > articles_backup.sql

-- Import to ekaty.com
mysql -u user -p ekaty_database < articles_backup.sql
```

Then run `fix_blog_links.php` to update all links to ekaty.com pages.

---

## 🎨 Customization for ekaty.com

### Update Branding:
1. **blog_manager.php** - Change header colors, logo
2. **blog.php** - Update styling to match ekaty.com theme
3. **article.php** - Match ekaty.com design

### Update AI Prompts:
In `generateArticleFromTitle()` function, update:
```php
$system_prompt = "You are writing for eKaty.com, [describe ekaty.com's focus]...";
```

### Update Contact Info:
Search and replace in all files:
- Phone: Update to ekaty.com phone
- Email: Update to ekaty.com email
- Company name: Strickland Technology → eKaty

---

## ✅ Post-Migration Checklist

- [ ] Admin interface accessible
- [ ] Can generate test article
- [ ] Blog listing page works
- [ ] Individual articles display
- [ ] Internal links work correctly
- [ ] AI generation works
- [ ] Link fixer works
- [ ] Database backups configured
- [ ] .env file protected
- [ ] Admin key changed
- [ ] Navigation updated
- [ ] Footer updated

---

## 🐛 Common Migration Issues

### "Database connection failed"
- Check credentials in `dbconnect.php`
- Verify database exists
- Test MySQL connection separately

### "API key not found"
- Verify `.env` file exists in root
- Check no extra spaces in API key
- Ensure file is named `.env` not `.env.txt`

### "Broken links in articles"
- Run `fix_blog_links.php`
- Update link mappings in `blog_manager.php`
- Verify page URLs are correct

### "Articles not showing"
- Check database table created
- Verify articles have status='published'
- Review SQL query in `blog.php`

---

## 📞 Need Help?

**James Strickland**  
Phone: 713-444-6732  
Email: james@stricklandtechnology.net

---

## 🎉 You're Done!

Your blog manager is now fully migrated to ekaty.com!

**Next Steps:**
1. Generate your first real article
2. Customize styling to match ekaty.com
3. Add blog link to main navigation
4. Start creating content!

**Estimated Monthly Cost:**
- 10 articles: $0.04
- 50 articles: $0.20
- 100 articles: $0.40

Happy blogging! 🚀
