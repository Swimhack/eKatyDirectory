# Restaurant Import Guide

Quick guide for manually importing specific restaurants into eKaty.

## 🎯 Use Cases

- Add a missing popular restaurant
- Update outdated restaurant information
- Ensure a specific restaurant is in the database
- Import newly opened restaurants

## 🚀 Three Ways to Import

### 1. Web Interface (Easiest) ⭐ Recommended

**URL:** https://ekaty.fly.dev/admin/import

**Steps:**
1. Go to https://ekaty.fly.dev/admin/import
2. Enter restaurant name (e.g., "Texas Roadhouse Katy")
3. Click "Search"
4. Review the result
5. Click "Import Restaurant"
6. Done! ✅

**Features:**
- ✅ Visual interface
- ✅ Preview before importing
- ✅ Shows if already in database
- ✅ Full restaurant details displayed
- ✅ Direct link to view imported restaurant

### 2. PowerShell Script (Fast)

**Command:**
```powershell
.\scripts\import-restaurant.ps1 -RestaurantName "Texas Roadhouse"
```

**Options:**
```powershell
# Production (default)
.\scripts\import-restaurant.ps1 -RestaurantName "Pappasito's Cantina"

# Local development
.\scripts\import-restaurant.ps1 -RestaurantName "BJ's Restaurant" -Environment local
```

**Features:**
- ✅ Command-line interface
- ✅ Confirmation prompt
- ✅ Detailed output
- ✅ Error handling

### 3. Direct API Call (Advanced)

**Search First (Optional):**
```bash
curl "https://ekaty.fly.dev/api/admin/import-restaurant?q=Texas%20Roadhouse"
```

**Import:**
```bash
curl -X POST https://ekaty.fly.dev/api/admin/import-restaurant \
  -H "Authorization: Bearer ekaty-admin-secret-2025" \
  -H "Content-Type: application/json" \
  -d '{"restaurantName":"Texas Roadhouse"}'
```

## 📊 What Gets Imported

When you import a restaurant, the system automatically fetches:

| Data | Source | Notes |
|------|--------|-------|
| ✅ Name | Google Places | Official business name |
| ✅ Address | Google Places | Full street address |
| ✅ Phone | Google Places | Formatted phone number |
| ✅ Website | Google Places | Official website URL |
| ✅ Hours | Google Places | Operating hours (all days) |
| ✅ Photos | Google Places | Up to 10 high-quality photos |
| ✅ Rating | Google Places | Average rating (1-5 stars) |
| ✅ Reviews | Google Places | Total review count |
| ✅ Price Level | Google Places | Budget/Moderate/Upscale/Premium |
| ✅ Cuisine Type | Google Places | Auto-detected from categories |
| ✅ GPS Coordinates | Google Places | Latitude & longitude |
| ✅ Business Status | Google Places | Operational status |

## 🔄 Update vs Create

### New Restaurant
If the restaurant doesn't exist in the database:
- ✨ Creates a new entry
- Sets `verified: true`
- Sets `active: true`
- Adds all available data

### Existing Restaurant
If the restaurant already exists:
- 🔄 Updates all fields with latest data
- Updates `lastVerified` timestamp
- Preserves restaurant ID and slug
- Merges new data with existing

## 💡 Pro Tips

### Search Tips
```
✅ Good: "Texas Roadhouse Katy"
✅ Good: "Pappasito's Cantina"
✅ Good: "BJ's Restaurant and Brewhouse"

❌ Avoid: "steakhouse" (too generic)
❌ Avoid: "restaurant near me" (not specific)
```

### Common Issues

**Issue:** "Restaurant not found"
**Solution:** 
- Include "Katy" or "Katy TX" in search
- Use the full official name
- Check spelling

**Issue:** "Already in database"
**Solution:**
- This is normal! Click import to update the data
- Updates ensure information is current

**Issue:** "Import failed"
**Solution:**
- Check GOOGLE_MAPS_API_KEY is configured
- Verify restaurant exists in Katy, TX area
- Try a more specific search term

## 📋 Bulk Import

To import multiple restaurants:

### Option 1: Web Interface (One at a time)
```
1. Import first restaurant
2. Click "Import Another"
3. Repeat
```

### Option 2: PowerShell Script (Batch)
```powershell
# Create a list
$restaurants = @(
    "Texas Roadhouse",
    "Pappasito's Cantina",
    "BJ's Restaurant",
    "Dish Society"
)

# Import each
foreach ($restaurant in $restaurants) {
    Write-Host "Importing: $restaurant"
    .\scripts\import-restaurant.ps1 -RestaurantName $restaurant
    Start-Sleep -Seconds 2
}
```

### Option 3: Use Multi-Source Sync
For comprehensive coverage, use the multi-source sync instead:
```powershell
.\scripts\trigger-multi-source-sync.ps1
```

## 🎯 Examples

### Example 1: Import Texas Roadhouse
```powershell
.\scripts\import-restaurant.ps1 -RestaurantName "Texas Roadhouse"
```

**Output:**
```
🔍 Searching for: Texas Roadhouse
✅ Found: Texas Roadhouse
   Address: 21720 Katy Fwy, Katy, TX 77449
   Rating: 4.2 ⭐
   Status: Not in database (will create new)

Import this restaurant? (Y/N): Y

📥 Importing restaurant...
✅ Success!

Action: created

Restaurant Details:
  Name: Texas Roadhouse
  Address: 21720 Katy Fwy
  Cuisine: Steakhouse, American
  Price Level: MODERATE
  Phone: (281) 392-7427
  Website: https://www.texasroadhouse.com
  Rating: 4.2 ⭐ (2847 reviews)

🌐 View at: https://ekaty.fly.dev/restaurant/texas-roadhouse
```

### Example 2: Update Existing Restaurant
```powershell
.\scripts\import-restaurant.ps1 -RestaurantName "Midway BBQ"
```

**Output:**
```
🔍 Searching for: Midway BBQ
✅ Found: Midway BBQ
   Address: 6025 Hwy Blvd, Katy, TX 77494
   Rating: 4.3 ⭐
   Status: Already in database (will update)

Import this restaurant? (Y/N): Y

📥 Importing restaurant...
✅ Success!

Action: updated

Restaurant Details:
  Name: Midway BBQ
  Address: 6025 Hwy Blvd
  Cuisine: BBQ
  Price Level: MODERATE
  Phone: (281) 391-2830
  Rating: 4.3 ⭐ (1794 reviews)

🌐 View at: https://ekaty.fly.dev/restaurant/midway-bbq
```

## 🔐 Security

- Admin authentication required
- Uses `ADMIN_API_KEY` from environment
- Only accessible to authorized users
- Rate limited by Google Places API

## 📈 Best Practices

1. **Before Importing:**
   - Check if restaurant already exists
   - Verify it's in Katy, TX area
   - Use official restaurant name

2. **After Importing:**
   - Visit the restaurant page to verify
   - Check photos and hours are correct
   - Confirm address and phone number

3. **Regular Updates:**
   - Re-import restaurants quarterly
   - Update after known changes (new location, hours, etc.)
   - Use multi-source sync for comprehensive updates

## 🆘 Troubleshooting

### Error: "Unauthorized"
**Cause:** Missing or incorrect API key  
**Fix:** Verify `ADMIN_API_KEY` is set correctly

### Error: "Restaurant not found"
**Cause:** Restaurant doesn't exist or wrong name  
**Fix:** 
- Try different search terms
- Include "Katy TX" in search
- Verify restaurant is actually in Katy

### Error: "API key not configured"
**Cause:** `GOOGLE_MAPS_API_KEY` not set  
**Fix:** Add key to `.env` or Fly.io secrets

### Error: "Rate limit exceeded"
**Cause:** Too many API calls  
**Fix:** Wait a few minutes and try again

## 📚 Related Documentation

- **Multi-Source Sync:** `MULTI_SOURCE_SETUP.md`
- **Validation:** `VALIDATION_REPORT.md`
- **Strategy:** `RESTAURANT_DATA_STRATEGY.md`

---

**Quick Links:**
- 🌐 Web Interface: https://ekaty.fly.dev/admin/import
- 📜 API Docs: `/api/admin/import-restaurant`
- 💻 Script: `scripts/import-restaurant.ps1`
