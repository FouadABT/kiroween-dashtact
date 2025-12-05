# PowerShell script to fix all toast calls in e-commerce files

$files = @(
    "frontend/src/app/dashboard/ecommerce/products/page.tsx",
    "frontend/src/app/dashboard/ecommerce/page.tsx",
    "frontend/src/app/dashboard/ecommerce/inventory/page.tsx",
    "frontend/src/app/dashboard/ecommerce/customers/[id]/page.tsx",
    "frontend/src/app/dashboard/ecommerce/customers/page.tsx",
    "frontend/src/components/inventory/InventoryAdjuster.tsx"
)

foreach ($file in $files) {
    Write-Host "Processing $file..."
    
    $content = Get-Content $file -Raw
    
    # Replace error toasts
    $content = $content -replace "toast\(\{\s*title:\s*'Error',\s*description:\s*'([^']+)',\s*variant:\s*'destructive',\s*\}\);", "toast.error('`$1');"
    $content = $content -replace "toast\(\{\s*title:\s*'Error',\s*description:\s*'([^']+)',\s*\}\);", "toast.error('`$1');"
    
    # Replace success toasts
    $content = $content -replace "toast\(\{\s*title:\s*'Success',\s*description:\s*'([^']+)',\s*\}\);", "toast.success('`$1');"
    
    # Replace copied/info toasts
    $content = $content -replace "toast\(\{\s*title:\s*'Copied',\s*description:\s*'([^']+)',\s*\}\);", "toast.success('`$1');"
    
    Set-Content $file $content -NoNewline
    Write-Host "Fixed $file"
}

Write-Host "All toast calls fixed!"
