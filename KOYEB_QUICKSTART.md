# Quick Start: Deploy to Koyeb

Get Catalyst running on Koyeb in under 5 minutes!

## 🚀 Option 1: One-Click Deploy (Fastest)

Click the button below to deploy Catalyst to Koyeb instantly:

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=docker&repository=github.com/nite/catalyst&branch=main&name=catalyst)

**What happens:**
1. You'll be redirected to Koyeb (sign in or create account)
2. Koyeb will detect the Dockerfile and configure the service
3. Click "Deploy" and wait 5-10 minutes
4. Your app will be live at `https://catalyst-<org>.koyeb.app`

## 🖥️ Option 2: Deploy via Dashboard (Recommended)

### Step 1: Sign Up/Sign In
1. Go to [koyeb.com](https://www.koyeb.com/)
2. Create an account or sign in

### Step 2: Create New App
1. Click **"Create App"**
2. Select **"GitHub"** as source
3. Connect your GitHub account if needed
4. Select repository: `nite/catalyst` (or your fork)
5. Select branch: `main`

### Step 3: Configure Service
**Builder Settings:**
- Builder: **Docker**
- Dockerfile: `Dockerfile`

**Instance Settings:**
- Instance type: **nano** (free tier)
- Regions: **Auto** (or select specific regions)

**Advanced Settings:**
- Port: **8000**
- Health check path: **/health**

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~5-10 minutes)
3. Access your app at the provided URL

## 💻 Option 3: Deploy via CLI (For Developers)

### Install Koyeb CLI

**macOS:**
```bash
brew install koyeb/tap/koyeb-cli
```

**Linux/WSL:**
```bash
curl -fsSL https://cli.koyeb.com/install.sh | sh
```

### Login
```bash
koyeb login
```

### Deploy
```bash
# Use the automated script
./deploy-koyeb.sh

# Or manually
koyeb service create catalyst-app \
  --app catalyst \
  --git github.com/nite/catalyst \
  --git-branch main \
  --git-builder docker \
  --ports 8000:http \
  --routes /:8000 \
  --instance-type nano \
  --health-checks http:8000:/health
```

### Monitor Deployment
```bash
# Watch logs
koyeb service logs catalyst-app -f

# Check status
koyeb service get catalyst-app
```

## ✅ Verify Deployment

Once deployed, verify everything works:

### 1. Check Health
```bash
curl https://<your-app>.koyeb.app/health
# Expected: {"status":"healthy","service":"catalyst"}
```

### 2. Test API
```bash
# List datasets
curl https://<your-app>.koyeb.app/api/datasets

# View API docs
open https://<your-app>.koyeb.app/docs
```

### 3. Test Web Interface
Open in browser:
```
https://<your-app>.koyeb.app/
```

You should see the Catalyst homepage with dataset listings.

## 🎯 What's Deployed?

Your Koyeb deployment includes:
- ✅ FastAPI backend (Python)
- ✅ React frontend (Vite + React)
- ✅ 15+ curated datasets
- ✅ Smart visualization engine
- ✅ Interactive filters and charts
- ✅ Mobile-responsive design
- ✅ Automatic SSL certificate
- ✅ Global CDN distribution

## 🔧 Configuration (Optional)

### Add Dataset API Keys

To enable additional datasets, add environment variables in Koyeb dashboard:

1. Go to **App Settings** → **Environment Variables**
2. Add any of these keys:

| Variable | Description | Get Key |
|----------|-------------|---------|
| `CENSUS_API_KEY` | US Census data | [Get key](https://api.census.gov/data/key_signup.html) |
| `OPENWEATHER_API_KEY` | Weather data | [Get key](https://openweathermap.org/api) |
| `FRED_API_KEY` | Economic data | [Get key](https://fred.stlouisfed.org/docs/api/api_key.html) |

3. Click **"Save"** and redeploy

### Scale Your App

**Upgrade instance:**
```bash
koyeb service update catalyst-app --instance-type micro
```

**Enable auto-scaling:**
```bash
koyeb service update catalyst-app --scale 1:3
```

### Add Custom Domain

1. Go to **App Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain
4. Update DNS with provided CNAME record
5. Wait for SSL certificate provisioning

## 📚 Next Steps

- 📖 Read the full deployment guide: [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md)
- 🔍 Explore the codebase: [README.md](README.md)
- 📊 Check available datasets: [API Documentation](https://your-app.koyeb.app/docs)
- 🛠️ Customize the app: Fork and modify the code

## 🆘 Need Help?

- **Koyeb Documentation**: [docs.koyeb.com](https://www.koyeb.com/docs)
- **Koyeb Support**: [support.koyeb.com](https://support.koyeb.com)
- **GitHub Issues**: [Report issues](https://github.com/nite/catalyst/issues)

## 🎉 That's It!

You now have Catalyst running on Koyeb's global infrastructure. Enjoy exploring data visualizations! 📊✨
