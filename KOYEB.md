# Quick Koyeb Deployment Guide

Deploy Catalyst to Koyeb in under 5 minutes - completely free!

## Why Koyeb?

- ✅ **Free tier:** 2 web services (perfect for backend + frontend)
- ✅ **$0/month:** No credit card required
- ✅ **Auto HTTPS:** Automatic SSL certificates
- ✅ **Global CDN:** Fast worldwide
- ✅ **Simple:** Deploy in 3 clicks from GitHub

## Steps

### 1. Prepare Your Repository

This repository is already configured for Koyeb deployment! The production Dockerfiles are ready to use.

### 2. Sign Up

1. Go to [koyeb.com](https://www.koyeb.com)
2. Sign up with GitHub (no credit card needed)

### 3. Deploy Backend

1. Click **"Create Service"**
2. Select **"GitHub"** as source
3. Authorize Koyeb to access your repository
4. Select **`nite/catalyst`** repository
5. Configure:
   - **Name:** `catalyst-backend`
   - **Builder:** Docker
   - **Dockerfile path:** `backend/Dockerfile.prod`
   - **Port:** `8011`
   - **Instance type:** `nano` (free tier)
6. Click **"Deploy"**
7. Wait ~2 minutes for deployment
8. **Copy the URL** (something like `https://catalyst-backend-yourname.koyeb.app`)

### 4. Deploy Frontend

1. Click **"Create Service"** again
2. Select **"GitHub"** as source
3. Select **`nite/catalyst`** repository
4. Configure:
   - **Name:** `catalyst-frontend`
   - **Builder:** Docker
   - **Dockerfile path:** `frontend/Dockerfile.prod`
   - **Port:** `80`
   - **Instance type:** `nano` (free tier)
   - **Environment Variables:**
     - `VITE_API_URL` = `https://catalyst-backend-yourname.koyeb.app` (from step 3)
5. Click **"Deploy"**
6. Wait ~3 minutes for deployment

### 5. Done! 🎉

Your Catalyst app is now live:
- **Frontend:** `https://catalyst-frontend-yourname.koyeb.app`
- **Backend:** `https://catalyst-backend-yourname.koyeb.app`

## Troubleshooting

### Frontend can't connect to Backend?

1. Go to frontend service settings
2. Update `VITE_API_URL` environment variable to your backend URL
3. Redeploy the frontend service

### Build fails?

- Check the build logs in Koyeb dashboard
- Ensure Dockerfile paths are correct:
  - Backend: `backend/Dockerfile.prod`
  - Frontend: `frontend/Dockerfile.prod`

### Need to update code?

Just push to GitHub! Koyeb automatically redeploys on every commit.

## Cost

**Total cost: $0/month** (using free tier)

## Auto-Deployment

Every time you push to `main` branch, Koyeb automatically:
1. Detects the change
2. Rebuilds the Docker images
3. Deploys the new version
4. Zero downtime deployment

## Scaling

Need more power?
- Upgrade to `small` instance: $5-7/month
- Enable auto-scaling based on traffic
- Add multiple regions for global performance

## Alternative: Deploy via CLI

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Deploy backend
koyeb service create catalyst-backend \
  --git github.com/nite/catalyst \
  --git-branch main \
  --git-workdir backend \
  --docker Dockerfile.prod \
  --ports 8011:http \
  --instance-type nano

# Deploy frontend (update BACKEND_URL)
koyeb service create catalyst-frontend \
  --git github.com/nite/catalyst \
  --git-branch main \
  --git-workdir frontend \
  --docker Dockerfile.prod \
  --ports 80:http \
  --instance-type nano \
  --env VITE_API_URL=https://catalyst-backend-yourname.koyeb.app
```

## Next Steps

- Configure custom domain
- Add database (PostgreSQL, MongoDB, etc.)
- Set up monitoring
- Enable auto-scaling

For more deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md)
