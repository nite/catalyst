# Render CLI Deployment - Step by Step Guide

## Current Status
✅ Render CLI installed and ready
✅ All deployment scripts created
✅ Configuration validated

## Complete These Steps to Deploy

### Step 1: Authenticate with Render

```bash
render login
```

This will:
- Open your browser for authentication
- Link the CLI to your Render account
- Set up credentials locally

### Step 2: Validate Configuration

```bash
cd /home/runner/work/catalyst/catalyst
render blueprints validate
```

Expected output: Configuration is valid

### Step 3: Deploy to Render

Since Render CLI's blueprint deployment requires the dashboard, use one of these methods:

**Method A: Dashboard Blueprint (Recommended)**
1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect to GitHub repository: `nite/catalyst`
4. Select branch: `copilot/add-dataset-integration-functionality`
5. Click "Apply"
6. Render will create both services automatically

**Method B: Create Services Manually via CLI**

Create Backend:
```bash
render services create web \
  --name catalyst-api \
  --repo https://github.com/nite/catalyst \
  --branch copilot/add-dataset-integration-functionality \
  --root-dir backend \
  --build-cmd "pip install -r requirements.txt" \
  --start-cmd "uvicorn app.main:app --host 0.0.0.0 --port \$PORT" \
  --env-key PYTHON_VERSION=3.11.0 \
  --env-key CORS_ORIGINS="*" \
  --health-check-path /health
```

Create Frontend:
```bash
render services create static \
  --name catalyst-frontend \
  --repo https://github.com/nite/catalyst \
  --branch copilot/add-dataset-integration-functionality \
  --root-dir frontend \
  --build-cmd "npm install && npm run build" \
  --publish-path ./dist \
  --env-key VITE_API_URL=https://catalyst-api.onrender.com/api/v1
```

### Step 4: Monitor Deployment

```bash
# List all services
render services list

# Watch backend logs
render logs -s catalyst-api --follow

# Watch frontend logs
render logs -s catalyst-frontend --follow

# Check deploy status
render deploys -s catalyst-api
```

### Step 5: Verify Deployment

Once services show as "live", run:

```bash
./verify-deployment.sh
```

Or manually test:

```bash
# Test backend health
curl https://catalyst-api.onrender.com/health

# Expected: {"status":"healthy"}

# Test frontend
curl -I https://catalyst-frontend.onrender.com

# Expected: HTTP/2 200
```

## Expected Timeline

- **Backend build**: 3-5 minutes
- **Frontend build**: 4-6 minutes
- **Total time**: ~5-10 minutes

## Troubleshooting

### Services not starting?
```bash
# Check logs for errors
render logs -s catalyst-api
render logs -s catalyst-frontend
```

### Build failures?
- Go to Render Dashboard
- Click on the failing service
- View "Logs" tab for detailed error messages

### Need to redeploy?
```bash
render deploys create -s catalyst-api
render deploys create -s catalyst-frontend
```

## After Successful Deployment

You'll have access to:

- **Frontend**: https://catalyst-frontend.onrender.com
- **Backend API**: https://catalyst-api.onrender.com
- **API Docs**: https://catalyst-api.onrender.com/docs

Test the application:
1. Visit the frontend URL
2. Browse the 15 available datasets
3. Click on a dataset to visualize
4. Try applying filters
5. Test on mobile device

## Commands Reference

```bash
# List services
render services list

# View logs
render logs -s <service-name>

# Restart service
render restart -s <service-name>

# Deploy new version
render deploys create -s <service-name>

# Open service in browser
render services open -s <service-name>
```
