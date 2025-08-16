#!/bin/bash

echo "🚀 Deploying SkillX Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Set environment variables
echo "📝 Setting environment variables..."
railway variables set NODE_ENV=production

# Deploy
echo "🚀 Deploying..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at: https://your-app-name.railway.app"
echo "🔍 Health check: https://your-app-name.railway.app/health"
