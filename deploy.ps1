# 🎯 BiPay System - Windows Quick Deployment Script
# Run this script to deploy your BiPay system instantly

Write-Host "🚀 BiPay System Deployment" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-Not (Test-Path "DEPLOY_GUIDE.md")) {
    Write-Host "❌ Please run this script from the bipay-system root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.10+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
Set-Location ..

# Install frontend dependencies  
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Build frontend for production
Write-Host "🏗️  Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

Write-Host ""
Write-Host "🎉 BiPay System Ready for Deployment!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🆓 FREE HOSTING - Vercel + Railway:" -ForegroundColor White
Write-Host "   Frontend: https://vercel.com/new" -ForegroundColor Gray
Write-Host "   Backend: https://railway.app/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🆓 FREE HOSTING - Netlify + Render:" -ForegroundColor White
Write-Host "   Frontend: https://app.netlify.com/start" -ForegroundColor Gray
Write-Host "   Backend: https://render.com/deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🐙 GitHub Pages + Heroku:" -ForegroundColor White
Write-Host "   Frontend: Use 'gh-pages' package" -ForegroundColor Gray
Write-Host "   Backend: Use 'heroku create'" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Frontend build: frontend/build/" -ForegroundColor Yellow
Write-Host "📁 Backend files: backend/" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Environment Variables:" -ForegroundColor Cyan
Write-Host "Backend: PORT=8000" -ForegroundColor Gray
Write-Host "Frontend: REACT_APP_API_URL=https://your-backend-url.com" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Local Testing:" -ForegroundColor Cyan
Write-Host "Backend: cd backend && python run.py" -ForegroundColor Gray
Write-Host "Frontend: cd frontend && npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Full guide: See DEPLOY_GUIDE.md" -ForegroundColor Blue
Write-Host ""
Write-Host "✅ Your BiPay system is ready for hackathon deployment!" -ForegroundColor Green
