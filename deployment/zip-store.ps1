# Quick zip for Spooky Store only
Write-Host "Zipping Spooky-store..." -ForegroundColor Cyan

# Change to Spooky-store directory
Set-Location "Spooky-store"

# Zip all contents (excluding node_modules, .next, dist, etc)
Get-ChildItem -Exclude node_modules,.next,dist,build,.git,coverage,uploads | Compress-Archive -DestinationPath "..\spooky-store-deploy.zip" -Force

# Go back
Set-Location ..

$size = (Get-Item "spooky-store-deploy.zip").Length / 1MB
Write-Host "✅ Created: spooky-store-deploy.zip ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
