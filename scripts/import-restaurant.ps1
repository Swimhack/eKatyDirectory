# Import a specific restaurant by name
param(
    [Parameter(Mandatory=$true)]
    [string]$RestaurantName,
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

$baseUrl = if ($Environment -eq "local") { "http://localhost:3000" } else { "https://ekaty.fly.dev" }

$headers = @{
    "Authorization" = "Bearer ekaty-admin-secret-2025"
    "Content-Type" = "application/json"
}

$body = @{
    restaurantName = $RestaurantName
} | ConvertTo-Json

Write-Host "🔍 Searching for: $RestaurantName" -ForegroundColor Cyan
Write-Host "Environment: $Environment ($baseUrl)" -ForegroundColor Gray
Write-Host ""

try {
    # First, search to preview
    Write-Host "Searching Google Places..." -ForegroundColor Yellow
    $searchUrl = "$baseUrl/api/admin/import-restaurant?q=$([System.Uri]::EscapeDataString($RestaurantName))"
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Method Get -TimeoutSec 30
    
    if ($searchResponse.found) {
        Write-Host "✅ Found: $($searchResponse.restaurant.name)" -ForegroundColor Green
        Write-Host "   Address: $($searchResponse.restaurant.address)"
        Write-Host "   Rating: $($searchResponse.restaurant.rating) ⭐"
        
        if ($searchResponse.restaurant.inDatabase) {
            Write-Host "   Status: Already in database (will update)" -ForegroundColor Yellow
        } else {
            Write-Host "   Status: Not in database (will create new)" -ForegroundColor Green
        }
        Write-Host ""
        
        # Confirm import
        $confirm = Read-Host "Import this restaurant? (Y/N)"
        if ($confirm -ne "Y" -and $confirm -ne "y") {
            Write-Host "Import cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    
    Write-Host ""
    Write-Host "📥 Importing restaurant..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/import-restaurant" -Method Post -Headers $headers -Body $body -TimeoutSec 60
    
    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Action: $($response.action)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Restaurant Details:" -ForegroundColor Yellow
    Write-Host "  Name: $($response.restaurant.name)"
    Write-Host "  Address: $($response.restaurant.address)"
    Write-Host "  Cuisine: $($response.restaurant.cuisineTypes)"
    Write-Host "  Price Level: $($response.restaurant.priceLevel)"
    
    if ($response.restaurant.phone) {
        Write-Host "  Phone: $($response.restaurant.phone)"
    }
    
    if ($response.restaurant.website) {
        Write-Host "  Website: $($response.restaurant.website)"
    }
    
    if ($response.restaurant.rating) {
        Write-Host "  Rating: $($response.restaurant.rating) ⭐ ($($response.restaurant.reviewCount) reviews)"
    }
    
    Write-Host ""
    Write-Host "🌐 View at: $baseUrl/restaurants/$($response.restaurant.slug)" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Import failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.ErrorDetails.Message) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorData.message) {
            Write-Host ""
            Write-Host "Error: $($errorData.message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check the restaurant name spelling"
    Write-Host "   2. Try including 'Katy TX' in the name"
    Write-Host "   3. Make sure GOOGLE_MAPS_API_KEY is configured"
    Write-Host "   4. Verify the restaurant exists in Katy, TX"
    
    exit 1
}
