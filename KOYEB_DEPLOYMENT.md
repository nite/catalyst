# Koyeb Deployment Guide

Complete guide for deploying Catalyst to Koyeb, a serverless platform for deploying applications globally.

## 🚀 Overview

Catalyst can be deployed to Koyeb using:
- **Docker-based deployment** (Recommended) - Uses the included Dockerfile
- **Git-based deployment** - Automatic build from GitHub repository
- **Infrastructure as Code** - Using `.koyeb/config.yaml`

## 📋 Prerequisites

1. **Koyeb Account**: Sign up at [koyeb.com](https://www.koyeb.com/)
2. **GitHub Repository**: Repository with Catalyst code
3. **Koyeb CLI** (Optional): For command-line deployments

### Install Koyeb CLI (Optional)

```bash
# macOS
brew install koyeb/tap/koyeb-cli

# Linux/WSL
curl -fsSL https://cli.koyeb.com/install.sh | sh

# Verify installation
koyeb version

# Login to Koyeb
koyeb login
```

## 🎯 Deployment Methods

### Method 1: Deploy via Koyeb Dashboard (Easiest)

#### Step 1: Create New App

1. Go to [Koyeb Dashboard](https://app.koyeb.com/)
2. Click **"Create App"**
3. Select **"Docker"** as deployment method

#### Step 2: Configure Docker Deployment

**Repository Settings:**
- **Repository**: `nite/catalyst` (or your fork)
- **Branch**: `main` (or your working branch)
- **Builder**: Docker
- **Dockerfile**: `Dockerfile` (at root)

**Service Settings:**
- **Service Name**: `catalyst-app`
- **Service Type**: Web
- **Port**: `8000`
- **Instance Type**: `nano` (can scale up later)

**Health Check:**
- **Path**: `/health`
- **Port**: `8000`
- **Initial Delay**: 30 seconds

#### Step 3: Environment Variables (Optional)

Add any API keys for additional datasets:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port | No (defaults to 8000) |
| `CENSUS_API_KEY` | US Census data | No |
| `OPENWEATHER_API_KEY` | Weather data | No |
| `FRED_API_KEY` | Economic data | No |

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (5-10 minutes)
3. Service will be available at `https://<app-name>-<org>.koyeb.app`

### Method 2: Deploy via Koyeb CLI

#### Using Docker

```bash
# Navigate to repository
cd /path/to/catalyst

# Create and deploy app
koyeb app create catalyst

# Deploy service
koyeb service create catalyst-app \
  --app catalyst \
  --git github.com/nite/catalyst \
  --git-branch main \
  --git-builder docker \
  --docker-dockerfile Dockerfile \
  --ports 8000:http \
  --routes /:8000 \
  --instance-type nano \
  --env PORT=8000 \
  --health-checks http:8000:/health

# Monitor deployment
koyeb service logs catalyst-app -f
```

#### Using Configuration File

The repository includes `.koyeb/config.yaml` for infrastructure as code:

```bash
# Deploy using config file
koyeb app init --config .koyeb/config.yaml

# Or update existing app
koyeb app update catalyst --config .koyeb/config.yaml
```

### Method 3: Deploy via GitHub Integration (Recommended)

#### Step 1: Connect GitHub

1. Go to **Settings** → **GitHub Integration**
2. Click **"Connect GitHub Account"**
3. Authorize Koyeb to access repositories
4. Select `nite/catalyst` repository

#### Step 2: Enable Auto-Deploy

1. Select branch to deploy (e.g., `main`)
2. Enable **"Auto-deploy on push"**
3. Choose **"Docker"** build method

#### Step 3: Configure Service

Same as Method 1, but deployments will automatically trigger on git push.

## 🔧 Configuration Details

### Dockerfile Deployment

The included `Dockerfile` is optimized for Koyeb:

```dockerfile
# Multi-stage build
FROM node:20-slim AS web     # Build React frontend
FROM python:3.12-slim AS api # Run FastAPI backend
```

**What it does:**
1. Builds React frontend (`web/dist`)
2. Installs Python dependencies
3. Copies frontend build to API
4. Serves both from single container on port 8000

### Environment Variables

Optional variables for enhanced functionality:

```bash
# Core settings (auto-configured)
PORT=8000
PYTHON_VERSION=3.12
NODE_VERSION=20

# Dataset API keys (optional)
CENSUS_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
WEATHERAPI_API_KEY=your_key_here
NASA_EARTHDATA_TOKEN=your_token_here
FRED_API_KEY=your_key_here
ALPHAVANTAGE_API_KEY=your_key_here
OPENAQ_API_KEY=your_key_here
SOCRATA_APP_TOKEN=your_token_here
```

### Health Checks

Koyeb monitors service health via:
- **Path**: `/health`
- **Expected Response**: `{"status": "healthy"}`
- **Timeout**: 5 seconds
- **Period**: 10 seconds

### Scaling Configuration

**Default Settings:**
- **Min Instances**: 1
- **Max Instances**: 1
- **Instance Type**: `nano` (512MB RAM, 0.1 vCPU)

**Available Instance Types:**
- `nano`: 512MB RAM, 0.1 vCPU (Free tier eligible)
- `micro`: 1GB RAM, 0.25 vCPU
- `small`: 2GB RAM, 0.5 vCPU
- `medium`: 4GB RAM, 1 vCPU
- `large`: 8GB RAM, 2 vCPU

## 🌍 Custom Domains

### Add Custom Domain

1. Go to **App Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `catalyst.yourdomain.com`)
4. Configure DNS records:

```
Type: CNAME
Name: catalyst (or your subdomain)
Value: <app-name>-<org>.koyeb.app
TTL: 3600
```

5. Wait for DNS propagation (5-30 minutes)
6. Koyeb automatically provisions SSL certificate

## 📊 Monitoring & Logs

### View Logs

**Via Dashboard:**
1. Go to **App** → **catalyst-app**
2. Click **"Logs"** tab
3. Real-time streaming logs

**Via CLI:**
```bash
# Stream logs
koyeb service logs catalyst-app -f

# Last 100 lines
koyeb service logs catalyst-app --tail 100

# Filter by timestamp
koyeb service logs catalyst-app --since 1h
```

### Metrics

**Available Metrics:**
- CPU usage
- Memory usage
- Network I/O
- Request rate
- Response time
- Error rate

**Access Metrics:**
1. **Dashboard**: App → Metrics tab
2. **CLI**: `koyeb service metrics catalyst-app`

## 🔄 Updates & Redeployments

### Manual Redeploy

**Via Dashboard:**
1. Go to **App** → **catalyst-app**
2. Click **"Redeploy"**

**Via CLI:**
```bash
koyeb service redeploy catalyst-app
```

### Automatic Deploys

With GitHub integration enabled:
1. Push code to configured branch
2. Koyeb automatically detects changes
3. Triggers new build and deployment
4. Zero-downtime rolling update

### Rollback

**Via Dashboard:**
1. Go to **Deployments** tab
2. Select previous deployment
3. Click **"Rollback"**

**Via CLI:**
```bash
# List deployments
koyeb service deployments list catalyst-app

# Rollback to specific deployment
koyeb service rollback catalyst-app --deployment <deployment-id>
```

## 🔐 Security Best Practices

1. **Environment Variables**: Store sensitive keys in Koyeb environment variables, not in code
2. **HTTPS**: Enabled by default on all Koyeb domains
3. **CORS**: Currently set to `allow_origins=["*"]` - restrict in production:
   ```python
   allow_origins=[
       "https://your-domain.com",
       "https://www.your-domain.com"
   ]
   ```
4. **Health Checks**: Keep `/health` endpoint public for monitoring
5. **API Keys**: Rotate regularly and use Koyeb secrets management

## 💰 Pricing

**Free Tier:**
- 1 `nano` instance
- 100 GB data transfer/month
- Unlimited deployments
- Community support

**Paid Plans:**
- Usage-based pricing
- Additional instance types
- More data transfer
- Priority support

See [Koyeb Pricing](https://www.koyeb.com/pricing) for details.

## 🐛 Troubleshooting

### Build Fails

**Issue**: Docker build fails
```bash
# Check build logs
koyeb service logs catalyst-app --deployment <deployment-id>

# Common fixes:
# 1. Verify Dockerfile syntax
# 2. Check dependency versions in requirements.txt and package.json
# 3. Ensure build context is correct (root directory)
```

### Service Not Starting

**Issue**: Service builds but doesn't start
```bash
# Check container logs
koyeb service logs catalyst-app -f

# Verify:
# 1. Port 8000 is exposed and app listens on it
# 2. Health check endpoint /health returns 200
# 3. Environment variables are set correctly
```

### Health Check Failing

**Issue**: Health check endpoint not responding
```bash
# Test health endpoint
curl https://<app-name>-<org>.koyeb.app/health

# Should return:
# {"status": "healthy", "service": "catalyst"}

# If not:
# 1. Check if app is running: koyeb service get catalyst-app
# 2. Review logs: koyeb service logs catalyst-app
# 3. Verify uvicorn is binding to 0.0.0.0:8000
```

### Out of Memory

**Issue**: Instance runs out of memory
```bash
# Check metrics
koyeb service metrics catalyst-app

# Solutions:
# 1. Upgrade instance type from nano to micro or small
# 2. Optimize Python/Node.js memory usage
# 3. Add memory limits to Dockerfile
```

## 📚 Additional Resources

- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Koyeb CLI Reference](https://www.koyeb.com/docs/cli)
- [Docker Deployment Guide](https://www.koyeb.com/docs/deploy/docker)
- [GitHub Integration](https://www.koyeb.com/docs/deploy/github)
- [Custom Domains](https://www.koyeb.com/docs/domains)
- [Environment Variables](https://www.koyeb.com/docs/environment-variables)

## 🎉 Post-Deployment Verification

After successful deployment, verify all features work:

### 1. API Health
```bash
curl https://<your-app>.koyeb.app/health
# Expected: {"status": "healthy", "service": "catalyst"}
```

### 2. API Endpoints
```bash
# List datasets
curl https://<your-app>.koyeb.app/api/datasets

# Get specific dataset
curl https://<your-app>.koyeb.app/api/datasets/world-gdp

# Check API docs
open https://<your-app>.koyeb.app/docs
```

### 3. Web Interface
```bash
# Open in browser
open https://<your-app>.koyeb.app/

# Verify:
# ✓ Homepage loads
# ✓ Dataset list displays
# ✓ Charts render
# ✓ Filters work
# ✓ Mobile responsive
```

## ✅ Deployment Checklist

- [ ] Koyeb account created
- [ ] Repository connected
- [ ] Service configured with Docker
- [ ] Port 8000 exposed
- [ ] Health checks configured
- [ ] Environment variables set (if needed)
- [ ] Build successful
- [ ] Service running and healthy
- [ ] API endpoints responding
- [ ] Web interface accessible
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled (optional)
- [ ] Monitoring and alerts set up

---

**🎊 Congratulations!** Your Catalyst app is now deployed on Koyeb and accessible globally.

For questions or issues, refer to [Koyeb Support](https://www.koyeb.com/support) or open an issue in the repository.
