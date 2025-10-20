#!/bin/bash

# Complete deployment script for EC2
echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/dashboard || exit 1
echo "📁 Current directory: $(pwd)"

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Restart frontend
echo "🔄 Restarting frontend..."
pm2 restart dashboard-app

# Navigate to backend
echo "🐍 Setting up backend..."
cd api

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart dashboard-api || pm2 start "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --name dashboard-api

# Save PM2 configuration
pm2 save

# Go back to root
cd ..

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "🧪 Testing backend:"
curl http://localhost:8000/ || echo "⚠️  Backend not responding"

echo ""
echo "🌐 Your app is live at:"
echo "   Frontend: http://13.61.12.168"
echo "   Backend:  http://13.61.12.168:8000"
echo ""
echo "📝 View logs:"
echo "   pm2 logs dashboard-app"
echo "   pm2 logs dashboard-api"

