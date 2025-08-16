# 🚀 Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- MongoDB Atlas database
- Node.js installed locally

## Step 1: Prepare Your Backend

### 1.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 1.2 Login to Railway
```bash
railway login
```

## Step 2: Deploy to Railway

### 2.1 Initialize Railway Project
```bash
cd SkillX-Backend-main
railway init
```

### 2.2 Set Environment Variables
```bash
# Required variables
railway variables set MONGO_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/skillx?retryWrites=true&w=majority"
railway variables set JWT_SECRET="your-super-secret-jwt-key-here"
railway variables set NODE_ENV="production"

# Optional variables (for email functionality)
railway variables set EMAIL_USER="your-email@gmail.com"
railway variables set EMAIL_PASS="your-app-password"
```

### 2.3 Deploy
```bash
railway up
```

## Step 3: Get Your Railway URL

After deployment, Railway will provide you with a URL like:
`https://your-app-name.railway.app`

## Step 4: Update Frontend Configuration

### 4.1 Create Production Environment File
Create `.env.production` in your frontend directory:
```env
VITE_API_URL=https://your-app-name.railway.app
```

### 4.2 Deploy Frontend
You can deploy your frontend to Vercel, Netlify, or any other platform.

## Step 5: Test Your Deployment

### 5.1 Health Check
Visit: `https://your-app-name.railway.app/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 5.2 API Test
Visit: `https://your-app-name.railway.app/api/careers`

Should return your career paths data.

## Step 6: Monitor Your Deployment

### 6.1 View Logs
```bash
railway logs
```

### 6.2 Check Status
```bash
railway status
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check your MONGO_URI is correct
   - Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)

2. **Environment Variables Not Set**
   - Run `railway variables` to see all variables
   - Set missing variables with `railway variables set KEY=VALUE`

3. **Build Failed**
   - Check `railway logs` for build errors
   - Ensure all dependencies are in package.json

4. **Health Check Failing**
   - Check if your server is starting correctly
   - Verify the `/health` endpoint exists

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `NODE_ENV` | ✅ | Set to "production" |
| `PORT` | ❌ | Railway sets this automatically |
| `EMAIL_USER` | ❌ | For email functionality |
| `EMAIL_PASS` | ❌ | For email functionality |

## Quick Deploy Script

Run the included deploy script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Check your MongoDB connection
4. Ensure all dependencies are installed
