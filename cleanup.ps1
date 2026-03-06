# PowerShell script to clean up node_modules and build artifacts
# Run this script to prepare for deployment

Write-Host "Cleaning up node_modules and build artifacts..." -ForegroundColor Yellow

# Remove node_modules
Write-Host "Removing frontend node_modules..." -ForegroundColor Cyan
if (Test-Path "frontend\node_modules") {
    Remove-Item -Path "frontend\node_modules" -Recurse -Force
    Write-Host "✓ Frontend node_modules removed" -ForegroundColor Green
}

Write-Host "Removing backend node_modules..." -ForegroundColor Cyan
if (Test-Path "backend\node_modules") {
    Remove-Item -Path "backend\node_modules" -Recurse -Force
    Write-Host "✓ Backend node_modules removed" -ForegroundColor Green
}

# Remove build artifacts (optional - comment out if you want to keep them)
Write-Host "Removing build artifacts..." -ForegroundColor Cyan
if (Test-Path "frontend\dist") {
    Write-Host "Note: Keeping frontend/dist for deployment" -ForegroundColor Yellow
    # Uncomment below to remove dist folder
    # Remove-Item -Path "frontend\dist" -Recurse -Force
}

# Remove temporary files
Write-Host "Removing temporary files..." -ForegroundColor Cyan
$tempFiles = @("update-api-urls.js", "fix-api-urls.js", "fix-imports.js")
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "✓ Removed $file" -ForegroundColor Green
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "`nTo reinstall dependencies:" -ForegroundColor Yellow
Write-Host "  cd frontend && npm install" -ForegroundColor White
Write-Host "  cd backend && npm install" -ForegroundColor White
