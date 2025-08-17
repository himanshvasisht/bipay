#!/bin/bash
# Quick deployment script for BiPay

echo "🚀 BiPay Deployment Helper"
echo "=========================="

# Check if services are running
echo "📡 Checking services..."

# Test backend
if curl -s http://localhost:8000/api/v1/system/stats > /dev/null; then
    echo "✅ Backend: Running on http://localhost:8000"
else
    echo "❌ Backend: Not running"
    echo "Start with: C:\\Users\\hp\\anaconda3\\python.exe backend\\run.py"
fi

# Test frontend  
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Running on http://localhost:3000"
else
    echo "❌ Frontend: Not running"
    echo "Start with: cd frontend && npm start"
fi

echo ""
echo "🌐 Ready URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "📚 See DEPLOYMENT.md for free hosting options"
