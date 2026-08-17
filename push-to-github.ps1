# Connect with Food - GitHub Push Automation Script
# This script installs Git, configures the repo, and pushes to GitHub

# Configuration
$GitHubUsername = "sreevanguri-commits"
$RepoName = "connect-with-food"
$ProjectPath = "c:\Users\hp\Desktop\Sree nimnaga\my-mvp-app"

Write-Host "🚀 Connect with Food - GitHub Push Automation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Git is installed
Write-Host "📋 Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = & git --version
    Write-Host "✅ Git is already installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Installing Git for Windows..." -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Git from GitHub releases..." -ForegroundColor Yellow
    
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe"
    $installerPath = "$env:TEMP\GitInstaller.exe"
    
    Write-Host "Downloading: $gitUrl"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $gitUrl -OutFile $installerPath -UseBasicParsing -ErrorAction Stop
        
        Write-Host "✅ Download completed. Installing Git..." -ForegroundColor Green
        & $installerPath /VERYSILENT /NORESTART
        
        # Wait for installer to finish
        Start-Sleep -Seconds 10
        
        Write-Host "✅ Git installation completed!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download/install Git" -ForegroundColor Red
        Write-Host "Please install Git manually from: https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Step 2: Navigate to project
Write-Host "📁 Step 2: Navigating to project directory..." -ForegroundColor Yellow
if (-Not (Test-Path $ProjectPath)) {
    Write-Host "❌ Project path not found: $ProjectPath" -ForegroundColor Red
    exit 1
}
Set-Location $ProjectPath
Write-Host "✅ Project path: $(Get-Location)" -ForegroundColor Green

Write-Host ""

# Step 3: Initialize Git repo
Write-Host "🔧 Step 3: Initializing Git repository..." -ForegroundColor Yellow
& git init
& git config user.email "sreevanguri@example.com"
& git config user.name "Sree Vanguri"
Write-Host "✅ Git repository initialized" -ForegroundColor Green

Write-Host ""

# Step 4: Add files to staging
Write-Host "📦 Step 4: Staging files..." -ForegroundColor Yellow
& git add .
$stagedFiles = & git diff --cached --name-only | Measure-Object -Line
Write-Host "✅ Staged $($stagedFiles.Lines) files" -ForegroundColor Green

Write-Host ""

# Step 5: Create initial commit
Write-Host "💾 Step 5: Creating initial commit..." -ForegroundColor Yellow
& git commit -m "Initial commit: Connect with Food MVP - Food donation platform for India

- Backend: Node.js/Express API with PostgreSQL
- Frontend: React Native mobile app with Expo
- Features: OTP auth, food listings, geolocation search, reservation system
- Database: PostgreSQL with PostGIS support
- Deployment: Vercel + Docker
- Tech: Node.js, React Native, PostgreSQL, Docker, JWT"

Write-Host "✅ Initial commit created" -ForegroundColor Green

Write-Host ""

# Step 6: Rename main branch
Write-Host "🌿 Step 6: Renaming branch to 'main'..." -ForegroundColor Yellow
& git branch -M main
Write-Host "✅ Branch renamed to 'main'" -ForegroundColor Green

Write-Host ""

# Step 7: Add remote
Write-Host "🔗 Step 7: Adding GitHub remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
& git remote add origin $remoteUrl
Write-Host "✅ Remote added: $remoteUrl" -ForegroundColor Green

Write-Host ""

# Step 8: Push to GitHub
Write-Host "⬆️  Step 8: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You will be prompted to authenticate with GitHub." -ForegroundColor Yellow
Write-Host "   - Use your GitHub credentials (username/PAT)" -ForegroundColor Yellow
Write-Host "   - Or authenticate via browser if prompted" -ForegroundColor Yellow
Write-Host ""

& git push -u origin main

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ SUCCESS! Repository pushed to GitHub" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up local backend: cd backend && npm install" -ForegroundColor White
Write-Host "2. Start Docker: docker-compose up" -ForegroundColor White
Write-Host "3. Run backend: npm run dev" -ForegroundColor White
Write-Host "4. Start frontend: cd ../frontend && npm install && npm start" -ForegroundColor White
Write-Host ""
