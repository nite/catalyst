# Deployment Guide

This guide covers deploying Catalyst to Render using the CLI, API, or Dashboard.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **Render CLI or API Key**: Either install the CLI or get an API key

## Quick Deploy

### Option 1: Render CLI (Recommended)

#### Install Render CLI

```bash
# Install using the official installer
curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh

# Or build from source
git clone https://github.com/render-oss/cli.git
cd cli
go build -o render .
sudo mv render /usr/local/bin/

# Verify installation
render --version
```

#### Authenticate

```bash
# Login to Render (opens browser)
render login

# Verify authentication
render whoami
```

#### Validate Configuration

```bash
# Validate render.yaml before deploying
cd /path/to/catalyst
render blueprints validate
```

#### Deploy Using CLI

```bash
# Run the deployment script
./deploy-cli.sh

# Or manually navigate to Dashboard and use Blueprint feature
# The CLI currently requires using the dashboard for blueprint deployments
```

#### Monitor Deployment

```bash
# List all services
render services list

# View backend logs
render logs -s catalyst-api

# View frontend deployment status  
render services -s catalyst-frontend

# Check deploy history
render deploys -s catalyst-api
```

### Option 2: Automated API Script

```bash
# 1. Set your Render API key
export RENDER_API_KEY='rnd_your_api_key_here'

# 2. Run the deployment script
./deploy.sh
```

This will:
- Deploy the backend API as a Web Service
- Deploy the frontend as a Static Site
- Display the URLs once complete

### Option 2: Manual API Deployment

```bash
# Set your API key
export RENDER_API_KEY='rnd_your_api_key_here'

# Install dependencies
pip install PyYAML requests

# Run deployment script
python3 deploy_render.py
```

### Option 3: Render Dashboard (GUI)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `nite/catalyst`
4. Select branch: `copilot/add-dataset-integration-functionality`
5. Click **"Apply"**

Render will automatically detect `render.yaml` and deploy both services.

## Getting Your API Key

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Go to [Account Settings](https://dashboard.render.com/account/settings)
3. Scroll to **"API Keys"** section
4. Click **"Generate New API Key"**
5. Copy the key (starts with `rnd_`)
6. Set it in your environment:
   ```bash
   export RENDER_API_KEY='rnd_your_key_here'
   ```

## Deployment Configuration

The deployment is configured in `render.yaml`:

### Backend Service (API)
- **Name**: `catalyst-api`
- **Type**: Web Service
- **Environment**: Python 3.11
- **Build**: `pip install -r requirements.txt`
- **Start**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health`

### Frontend Service
- **Name**: `catalyst-frontend`
- **Type**: Static Site
- **Build**: `npm install && npm run build`
- **Publish**: `frontend/dist`
- **Environment**: 
  - `VITE_API_URL`: Points to backend API URL

## Expected URLs

After deployment (~5-10 minutes), you'll get:

- **Backend API**: `https://catalyst-api.onrender.com`
  - API Docs: `https://catalyst-api.onrender.com/docs`
  - Health: `https://catalyst-api.onrender.com/health`

- **Frontend App**: `https://catalyst-frontend.onrender.com`

## Deployment Timeline

| Service | Build Time | Total Time |
|---------|-----------|------------|
| Backend | ~3-5 min  | ~5-7 min   |
| Frontend| ~4-6 min  | ~6-10 min  |

## Verifying Deployment

### Check Backend
```bash
curl https://catalyst-api.onrender.com/health
# Expected: {"status":"healthy"}
```

### Check Frontend
Visit: `https://catalyst-frontend.onrender.com`

You should see the Catalyst homepage with 15 datasets.

## Deployment Scripts

### `deploy.sh`
Main deployment script that:
1. Validates API key
2. Installs dependencies
3. Runs Python deployment script
4. Reports success/failure

### `deploy_render.py`
Python script that uses Render API to:
1. Parse `render.yaml`
2. Create backend web service
3. Create frontend static site
4. Configure environment variables
5. Display deployment URLs

## Troubleshooting

### "RENDER_API_KEY not set"
```bash
export RENDER_API_KEY='rnd_your_api_key_here'
```

### "Failed to get owner ID"
- Check API key is valid
- Ensure you're authenticated
- Try regenerating the API key

### "Service already exists"
- Services with the same name already exist
- Delete old services from Dashboard first
- Or rename in `render.yaml`

### Build Failures
Check logs in Render Dashboard:
1. Go to [Services](https://dashboard.render.com/services)
2. Click on the failing service
3. View "Logs" tab for error details

## Environment Variables

### Backend
- `PYTHON_VERSION`: 3.11.0
- `CORS_ORIGINS`: * (allows all origins)

### Frontend
- `VITE_API_URL`: Backend API URL (auto-configured)

## Manual Deployment Commands

If you prefer using curl directly:

```bash
# Create Backend Service
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "catalyst-api",
    "type": "web_service",
    "repo": "https://github.com/nite/catalyst",
    "branch": "copilot/add-dataset-integration-functionality",
    "serviceDetails": {
      "env": "python",
      "region": "oregon",
      "plan": "free"
    }
  }'
```

## Updating Deployment

To update an existing deployment:

```bash
# Trigger a new deploy (pushes to GitHub automatically trigger deploys)
git push origin copilot/add-dataset-integration-functionality
```

Or manually in Dashboard:
1. Go to service
2. Click "Manual Deploy" → "Deploy latest commit"

## Cost

**Free Tier Includes:**
- ✅ 750 hours/month of web service
- ✅ Unlimited static sites
- ✅ Auto-scaling
- ✅ Custom domains
- ✅ Automatic HTTPS

Services will sleep after 15 minutes of inactivity (free tier).

## Next Steps

After deployment:
1. Visit your frontend URL
2. Browse the 15 available datasets
3. Test visualizations and filters
4. Check API documentation at `/docs`

## Support

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Support**: support@render.com

---

**Quick Reference:**

```bash
# Set API key
export RENDER_API_KEY='rnd_xxx'

# Deploy
./deploy.sh

# Check backend
curl https://catalyst-api.onrender.com/health

# View logs
# Go to dashboard.render.com/services
```
