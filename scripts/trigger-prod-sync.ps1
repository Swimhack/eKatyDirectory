$headers = @{
    "Authorization" = "Bearer ekaty-admin-secret-2025"
    "Content-Type" = "application/json"
}

Write-Host "Triggering restaurant sync on production..."
Write-Host "URL: https://ekaty.fly.dev/api/admin/sync"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://ekaty.fly.dev/api/admin/sync" -Method Post -Headers $headers -TimeoutSec 600
    
    Write-Host "Sync completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:"
    Write-Host "Discovered:" $response.stats.discovered "restaurants"
    Write-Host "Created:" $response.stats.created "new"
    Write-Host "Updated:" $response.stats.updated "existing"
    Write-Host "Failed:" $response.stats.failed
    Write-Host "Duplicates removed:" $response.stats.duplicatesRemoved
    Write-Host ""
    Write-Host "Your site should now show restaurants at https://ekaty.fly.dev"
} catch {
    Write-Host "Sync failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
