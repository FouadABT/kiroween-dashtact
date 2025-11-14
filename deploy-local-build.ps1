# Local Build & Deploy Script
# Run from project root directory

Write-Host "=== Starting Local Build Deployment ===" -ForegroundColor Green

# Step 1: Build frontend locally
Write-Host "`n[1/6] Building frontend locally..." -ForegroundColor Cyan
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Set-Location ..

# Step 2: Transfer .next folder
Write-Host "`n[2/6] Transferring .next folder to server..." -ForegroundColor Cyan
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r frontend/.next ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Transfer failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Transfer complete!" -ForegroundColor Green

# Step 3: Transfer config files
Write-Host "`n[3/6] Transferring configuration files..." -ForegroundColor Cyan
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" frontend/.env.production frontend/package.json frontend/next.config.ts ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/

# Step 4: Install production dependencies
Write-Host "`n[4/6] Installing production dependencies on server..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && npm install --production"

# Step 5: Restart frontend
Write-Host "`n[5/6] Restarting frontend service..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && cp .env.production .env.local && pm2 restart kit-frontend && pm2 save"

Start-Sleep -Seconds 5

# Step 6: Verify deployment
Write-Host "`n[6/6] Verifying deployment..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 list"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Visit: https://kit.dashtact.com" -ForegroundColor Yellow
Write-Host "`nCheck logs with: ssh -i 'C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem' ubuntu@13.53.218.109 'pm2 logs kit-frontend --lines 20'" -ForegroundColor Gray
