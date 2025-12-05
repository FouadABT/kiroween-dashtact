# Deploy Apps Zip Script - Excludes node_modules and heavy files

Write-Host "=== Creating deployment archives ===" -ForegroundColor Cyan

# Folders to exclude
$excludeDirs = @(
    "node_modules",
    ".next",
    "dist",
    "build",
    ".git",
    "coverage",
    ".turbo",
    "uploads",
    ".cache"
)

# Function to create zip from source directory
function Create-DeployZip {
    param(
        [string]$SourcePath,
        [string]$ZipName
    )
    
    Write-Host "Creating $ZipName..." -ForegroundColor Yellow
    
    $currentDir = Get-Location
    $zipPath = Join-Path $currentDir $ZipName
    
    # Remove old zip if exists
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    # Change to source directory and zip contents
    Set-Location $SourcePath
    
    # Get items to zip (exclude patterns)
    $items = Get-ChildItem -Force | Where-Object {
        $item = $_
        $exclude = $false
        
        foreach ($dir in $excludeDirs) {
            if ($item.Name -eq $dir) {
                $exclude = $true
                break
            }
        }
        
        -not $exclude
    }
    
    # Create zip
    $items | Compress-Archive -DestinationPath $zipPath -Force
    
    Set-Location $currentDir
    
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Host "✅ Created: $ZipName ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
}

# Create archives
Create-DeployZip -SourcePath "coachdashtact" -ZipName "coachdashtact-deploy.zip"
Create-DeployZip -SourcePath "Spooky-store" -ZipName "spooky-store-deploy.zip"

Write-Host "`n=== Archives created successfully ===" -ForegroundColor Green
Get-ChildItem *-deploy.zip | Format-Table Name, @{Label="Size (MB)"; Expression={[math]::Round($_.Length / 1MB, 2)}}
