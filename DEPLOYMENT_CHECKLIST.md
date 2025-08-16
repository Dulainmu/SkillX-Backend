# ✅ Railway Deployment Checklist

## Before Deployment

- [ ] **Railway Account**: Created account at https://railway.app
- [ ] **MongoDB Atlas**: Database is set up and accessible
- [ ] **Environment Variables**: Prepared all required variables
- [ ] **Railway CLI**: Installed and logged in

## Required Environment Variables

- [ ] `MONGO_URI` - Your MongoDB connection string
- [ ] `JWT_SECRET` - A secure random string for JWT tokens
- [ ] `NODE_ENV` - Set to "production"

## Deployment Steps

1. [ ] **Initialize Railway Project**
   ```bash
   railway init
   ```

2. [ ] **Set Environment Variables**
   ```bash
   railway variables set MONGO_URI="your-mongodb-uri"
   railway variables set JWT_SECRET="your-secret-key"
   railway variables set NODE_ENV="production"
   ```

3. [ ] **Deploy**
   ```bash
   railway up
   ```

4. [ ] **Get Railway URL**
   - Note down your Railway app URL
   - Format: `https://your-app-name.railway.app`

## Post-Deployment Testing

- [ ] **Health Check**: Visit `/health` endpoint
- [ ] **API Test**: Visit `/api/careers` endpoint
- [ ] **Database Connection**: Verify data is loading
- [ ] **Authentication**: Test login/signup endpoints

## Frontend Updates

- [ ] **Update API URL**: Set `VITE_API_URL` to your Railway URL
- [ ] **Deploy Frontend**: Deploy to Vercel/Netlify/etc.
- [ ] **Test Integration**: Verify frontend connects to Railway backend

## Monitoring

- [ ] **Check Logs**: `railway logs`
- [ ] **Monitor Performance**: Check Railway dashboard
- [ ] **Set Up Alerts**: Configure monitoring if needed

## Troubleshooting Commands

```bash
# View logs
railway logs

# Check status
railway status

# View variables
railway variables

# Redeploy
railway up

# Open in browser
railway open
```

## Success Indicators

✅ Health check returns `{"status": "OK"}`
✅ API endpoints respond correctly
✅ Database operations work
✅ Frontend can connect to backend
✅ No errors in Railway logs
