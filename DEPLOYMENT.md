# Deployment Guide - Tenant Management App

This guide will help you deploy your tenant management application to free hosting platforms.

## Prerequisites

1. **GitHub Account**: Push your code to GitHub
2. **MongoDB Atlas Account**: For database hosting
3. **Vercel Account**: For frontend hosting
4. **Render Account**: For backend hosting

## Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with read/write permissions
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/tenant-management?retryWrites=true&w=majority
   ```

## Step 2: Backend Deployment (Render)

1. Go to [Render](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tenant-management-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `CORS_ORIGIN`: Your frontend URL (update after frontend deployment)

6. Click "Create Web Service"
7. Wait for deployment and note your backend URL (e.g., `https://tenant-management-api.onrender.com`)

## Step 3: Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL from Step 2

6. Click "Deploy"
7. Wait for deployment and note your frontend URL

## Step 4: Update CORS Configuration

1. Go back to your Render dashboard
2. Update the `CORS_ORIGIN` environment variable with your Vercel frontend URL
3. Redeploy the service

## Step 5: Update Frontend API URL

1. Go to your Vercel dashboard
2. Update the `REACT_APP_API_URL` environment variable with your Render backend URL
3. Redeploy the frontend

## Environment Variables Reference

### Backend (Render)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenant-management
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGIN` is set correctly
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **Build Failures**: Check if all dependencies are in package.json
4. **Environment Variables**: Ensure all required variables are set

### Useful Commands:

```bash
# Test backend locally
cd server
npm install
npm start

# Test frontend locally
cd client
npm install
npm start
```

## Security Notes

1. **JWT Secret**: Use a strong, random string for production
2. **MongoDB**: Use environment variables, never commit credentials
3. **CORS**: Only allow your frontend domain
4. **File Uploads**: Consider using cloud storage for production

## Monitoring

- **Render**: Check logs in the dashboard
- **Vercel**: Monitor deployments and performance
- **MongoDB Atlas**: Monitor database usage and performance

## Cost Optimization

- **Render Free Tier**: 750 hours/month (enough for small apps)
- **Vercel Free Tier**: Unlimited deployments, 100GB bandwidth
- **MongoDB Atlas Free Tier**: 512MB storage

Your app should now be live and accessible from anywhere! 