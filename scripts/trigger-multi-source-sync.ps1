# Multi-Source Restaurant Sync Script
# Triggers sync from Google Places, Yelp, Foursquare, and OpenStreetMap

$headers = @{
    "Authorization" = "Bearer ekaty-admin-secret-2025"
    "Content-Type" = "application/json"
}

Write-Host "🚀 Triggering multi-source restaurant sync on production..." -ForegroundColor Cyan
Write-Host "URL: https://ekaty.fly.dev/api/admin/sync-multi-source"
Write-Host ""
Write-Host "📡 Data Sources:" -ForegroundColor Yellow
Write-Host "  • Google Places API (Primary)"
Write-Host "  • Yelp Fusion API"
Write-Host "  • Foursquare Places API"
Write-Host "  • OpenStreetMap Overpass API"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://ekaty.fly.dev/api/admin/sync-multi-source" -Method Post -Headers $headers -TimeoutSec 600
    
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Source Breakdown:" -ForegroundColor Cyan
    if ($response.stats.sources) {
        foreach ($source in $response.stats.sources.PSObject.Properties) {
            Write-Host "   $($source.Name): $($source.Value) restaurants"
        }
    }
    Write-Host ""
    Write-Host "📈 Results:" -ForegroundColor Yellow
    Write-Host "   Total Discovered: $($response.stats.discovered) restaurants"
    Write-Host "   Deduplicated: $($response.stats.deduplicated) duplicates removed"
    Write-Host "   Created: $($response.stats.created) new restaurants"
    Write-Host "   Updated: $($response.stats.updated) existing restaurants"
    Write-Host "   Failed: $($response.stats.failed)"
    
    if ($response.stats.errors -and $response.stats.errors.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
        foreach ($error in $response.stats.errors) {
            Write-Host "   - $error"
        }
    }
    
    Write-Host ""
    $uniqueRestaurants = $response.stats.discovered - $response.stats.deduplicated
    Write-Host "✨ Total Unique Restaurants: $uniqueRestaurants" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your site should now have comprehensive coverage at https://ekaty.fly.dev" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Sync failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check if API keys are configured (YELP_API_KEY, FOURSQUARE_API_KEY)"
    Write-Host "   2. Verify GOOGLE_MAPS_API_KEY is set"
    Write-Host "   3. Check Fly.io logs: fly logs -a ekaty"
    Write-Host "   4. See MULTI_SOURCE_SETUP.md for detailed setup instructions"
}
