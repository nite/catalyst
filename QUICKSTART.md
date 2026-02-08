# 🚀 Quick Start - Deploy to Render

## Choose Your Deployment Method

### Method 1: Render CLI ⭐ (Recommended)

```bash
# 1. Install Render CLI
curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh

# If that doesn't work, build from source:
git clone https://github.com/render-oss/cli.git
cd cli
go build -o render .
sudo mv render /usr/local/bin/

# 2. Authenticate
render login
# This will open your browser to log in

# 3. Validate your configuration
cd /path/to/catalyst
render blueprints validate

# 4. Deploy via Dashboard
# The CLI currently uses the dashboard for blueprint deployments:
# - Go to https://dashboard.render.com
# - Click "New" → "Blueprint"
# - Select your repo and branch
# - Render detects render.yaml automatically

# 5. Monitor deployment
render services list
render logs -s catalyst-api
render logs -s catalyst-frontend
```

### Method 2: API Script

```bash
# 1. Get your API key
# Go to https://dashboard.render.com/account/settings
# Generate new API key under "API Keys"

# 2. Set environment variable
export RENDER_API_KEY='rnd_your_api_key_here'

# 3. Deploy
./deploy.sh

# The script will:
# - Create backend web service
# - Create frontend static site
# - Display URLs
```

### Method 3: Dashboard (No CLI/API needed)

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect GitHub: `nite/catalyst`
4. Branch: `copilot/add-dataset-integration-functionality`
5. Click **"Apply"**

## What Gets Deployed

### Backend (catalyst-api)
- **Type**: Web Service
- **Runtime**: Python 3.11
- **Build Time**: ~3-5 minutes
- **URL**: `https://catalyst-api.onrender.com`
- **Health Check**: `/health`
- **API Docs**: `/docs`

### Frontend (catalyst-frontend)
- **Type**: Static Site
- **Build**: npm + Vite
- **Build Time**: ~4-6 minutes
- **URL**: `https://catalyst-frontend.onrender.com`

## After Deployment

### Verify Backend
```bash
curl https://catalyst-api.onrender.com/health
# Expected: {"status":"healthy"}

# View API docs
open https://catalyst-api.onrender.com/docs
```

### Verify Frontend
```bash
# Open in browser
open https://catalyst-frontend.onrender.com

# You should see:
# - Homepage with 15 datasets
# - Search and filter controls
# - Dataset cards
```

## Common Commands

### Using Render CLI
```bash
# List all services
render services list

# View backend logs
render logs -s catalyst-api

# View frontend logs  
render logs -s catalyst-frontend

# Check deploy history
render deploys -s catalyst-api

# Restart service
render restart -s catalyst-api

# Open service in browser
render services open -s catalyst-frontend
```

### Troubleshooting

**"RENDER_API_KEY not set"**
```bash
export RENDER_API_KEY='rnd_your_key'
```

**"render: command not found"**
```bash
# Install CLI first
curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh
```

**"No workspace specified"**
```bash
# Login first
render login
```

**Build Failed**
- Check logs in Render Dashboard
- Go to service → "Logs" tab
- Look for error messages

## URLs After Deployment

Once deployed (5-10 minutes), access your application:

- **Frontend**: `https://catalyst-frontend.onrender.com`
- **Backend API**: `https://catalyst-api.onrender.com`
- **API Docs**: `https://catalyst-api.onrender.com/docs`
- **Health Check**: `https://catalyst-api.onrender.com/health`

## Free Tier Limits

✅ 750 hours/month web service
✅ Unlimited static sites  
✅ Auto HTTPS
✅ Custom domains
⚠️ Services sleep after 15 min inactivity

## Next Steps

1. ⭐ Deploy using your preferred method
2. 🔍 Test the application
3. 📊 Browse the 15+ datasets
4. 🎨 Try different visualizations
5. 🔧 Monitor with Render CLI

---

**Need Help?**
- 📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- 🌐 Render Docs: https://render.com/docs
- 💬 Support: support@render.com
