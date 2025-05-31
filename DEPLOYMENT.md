# EcoVolt Deployment Guide

This guide will help you deploy the EcoVolt Charging Station Management System to Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub repository: `https://github.com/Aaditya7171/EcoVolt.git`
- Render account (free tier available)
- Vercel account (free tier available)

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `ecovolt-db`
   - **Database**: `ecovolt`
   - **User**: `ecovolt_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click "Create Database"
5. **Save the connection details** - you'll need them later

### Step 2: Deploy Backend Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository: `https://github.com/Aaditya7171/EcoVolt.git`
3. Configure:
   - **Name**: `ecovolt-backend`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### Step 3: Set Environment Variables

In the backend service settings, add these environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your PostgreSQL connection string from Step 1]
JWT_SECRET=[Generate a strong random string]
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://ecovolt.vercel.app
```

**Important**: 
- Replace `[Your PostgreSQL connection string]` with the actual connection string from your database
- Generate a strong JWT secret (at least 32 characters)
- Update `FRONTEND_URL` with your actual Vercel domain

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://ecovolt-backend.onrender.com`)

## Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

1. Update `frontend/.env.production` with your actual backend URL:
```
VITE_API_URL=https://your-actual-backend-url.onrender.com/api
```

2. Update `frontend/vercel.json` with the same URL

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

6. Click "Deploy"

### Step 3: Update Backend CORS

After getting your Vercel URL, update the backend environment variables:

1. Go to your Render backend service
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. The backend will automatically restart

## Post-Deployment Steps

### 1. Test the Application

1. Visit your Vercel frontend URL
2. Try registering a new account
3. Test creating a charging station
4. Verify map functionality

### 2. Update Repository

Update your repository with the production URLs:

1. Update `frontend/.env.production` with actual backend URL
2. Update `frontend/vercel.json` with actual backend URL
3. Commit and push changes

### 3. Set up Custom Domains (Optional)

#### For Vercel (Frontend):
1. Go to your project settings in Vercel
2. Add your custom domain
3. Configure DNS records

#### For Render (Backend):
1. Go to your service settings in Render
2. Add custom domain
3. Configure DNS records

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=EcoVolt
VITE_APP_VERSION=1.0.0
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend `FRONTEND_URL` matches your Vercel domain
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **API Not Found**: Check `VITE_API_URL` in frontend environment
4. **Build Failures**: Check build logs in respective platforms

### Logs:

- **Render**: View logs in service dashboard
- **Vercel**: View function logs and build logs in project dashboard

## Monitoring

### Free Tier Limitations:

- **Render**: Service sleeps after 15 minutes of inactivity
- **Vercel**: 100GB bandwidth per month
- **PostgreSQL**: 1GB storage on free tier

### Upgrading:

Consider upgrading to paid plans for production use to get:
- Always-on services
- More storage and bandwidth
- Better performance
- Custom domains
- SSL certificates

## Support

If you encounter issues:

1. Check the logs in both Render and Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure your GitHub repository is up to date
4. Test locally first to isolate deployment issues

Your EcoVolt application should now be live and accessible worldwide! 🚀
