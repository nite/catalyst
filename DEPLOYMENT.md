# Catalyst Deployment Guide

This guide covers deploying Catalyst to various cloud platforms, with a focus on cost-effective alternatives to traditional cloud providers like GKS (Google Kubernetes Engine) and Azure.

## Table of Contents

- [Cost Comparison](#cost-comparison)
- [Deployment Options](#deployment-options)
  - [Koyeb (Recommended for Cost-Efficiency)](#koyeb-recommended-for-cost-efficiency)
  - [Render](#render)
  - [Railway](#railway)
  - [Fly.io](#flyio)
  - [Traditional Cloud (GKS, Azure, AWS)](#traditional-cloud-gks-azure-aws)
- [Production Considerations](#production-considerations)

## Cost Comparison

Here's a comparison of monthly costs for running Catalyst (Backend + Frontend):

| Platform | Backend (Node.js) | Frontend (Static/React) | Total/Month | Free Tier | Notes |
|----------|------------------|------------------------|-------------|-----------|-------|
| **Koyeb** | $0-5 | $0-5 | **$0-10** | ✅ 2 services | Auto-scaling, Docker support |
| **Render** | $7 | $0 | **$7** | ✅ Static sites | Easy setup, good DX |
| **Railway** | $5-10 | $0-5 | **$5-15** | ✅ $5 credit/mo | Great for prototypes |
| **Fly.io** | $0-5 | $0 | **$0-5** | ✅ Generous free tier | Close to users, excellent performance |
| **Azure App Service** | $13+ | $13+ | **$26+** | ❌ | Enterprise features |
| **GKS (Kubernetes)** | $70+ | Included | **$70+** | ❌ | Cluster management overhead |
| **AWS (ECS)** | $15+ | $1-5 | **$16+** | ⚠️ Limited | Complex setup |

**Winner for Cost:** Koyeb or Fly.io offer the best value for small to medium applications.

## Deployment Options

### Koyeb (Recommended for Cost-Efficiency)

Koyeb is an excellent choice for deploying Catalyst with its generous free tier and simple deployment process.

#### Advantages
- ✅ Free tier includes 2 web services (perfect for backend + frontend)
- ✅ Automatic HTTPS
- ✅ Global edge network
- ✅ Docker support
- ✅ Auto-scaling
- ✅ Built-in CI/CD from GitHub
- ✅ No credit card required for free tier

#### Backend Deployment

1. **Sign up at [Koyeb](https://www.koyeb.com)**

2. **Create a new service:**
   - Click "Create Service"
   - Select "GitHub" as source
   - Choose your repository
   - Set build source: `backend/Dockerfile.prod`
   - Configure:
     ```
     Name: catalyst-backend
     Port: 8011
     Instance Type: nano (free tier)
     ```

3. **Environment Variables:**
   ```
   PORT=8011
   NODE_ENV=production
   ```

4. **Deploy and copy the service URL** (e.g., `https://catalyst-backend-yourname.koyeb.app`)

#### Frontend Deployment

1. **Create another service:**
   - Click "Create Service"
   - Select "GitHub" as source
   - Choose your repository
   - Set build source: `frontend/Dockerfile.prod`
   - Configure:
     ```
     Name: catalyst-frontend
     Port: 80
     Instance Type: nano (free tier)
     ```

2. **Environment Variables:**
   ```
   VITE_API_URL=https://catalyst-backend-yourname.koyeb.app
   VITE_PORT=3011
   ```

3. **Deploy**

#### Production Dockerfile for Frontend

For production deployment, update `frontend/Dockerfile` to use a proper production build:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

You'll also need an `nginx.conf` in the frontend directory:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Note:** The frontend will connect to the backend using the `VITE_API_URL` environment variable configured at build time.

#### Alternative: Using koyeb.yaml

Create `.koyeb/config.yaml` for Infrastructure as Code:

```yaml
services:
  - name: catalyst-backend
    git:
      repository: github.com/yourname/catalyst
      branch: main
      workdir: /backend
    instance:
      type: nano
    ports:
      - port: 8011
        protocol: http
    env:
      - name: PORT
        value: "8011"
      - name: NODE_ENV
        value: production
    docker:
      dockerfile: ./Dockerfile

  - name: catalyst-frontend
    git:
      repository: github.com/yourname/catalyst
      branch: main
      workdir: /frontend
    instance:
      type: nano
    ports:
      - port: 80
        protocol: http
    env:
      - name: VITE_API_URL
        value: https://catalyst-backend-yourname.koyeb.app
    docker:
      dockerfile: ./Dockerfile
```

### Render

Render offers a great developer experience with free static site hosting.

#### Deployment Steps

1. **Backend (Web Service):**
   - Connect GitHub repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Starter ($7/month) or Free (with limitations)
   - Environment: `PORT=8011`, `NODE_ENV=production`

2. **Frontend (Static Site):**
   - Connect GitHub repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Plan: Free
   - Environment: `VITE_API_URL=https://catalyst-backend.onrender.com`

**Cost:** ~$7/month (backend only, frontend is free)

### Railway

Railway is excellent for quick deployments with a generous free tier.

#### Deployment Steps

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   railway init
   railway up
   railway open
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   railway init
   railway up
   railway open
   ```

4. **Set environment variables** in Railway dashboard

**Cost:** $5/month (with $5 free credit)

### Fly.io

Fly.io offers excellent global performance with generous free tier (3 shared-cpu-1x VMs).

#### Deployment Steps

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   flyctl auth login
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   flyctl launch --name catalyst-backend
   flyctl deploy
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   flyctl launch --name catalyst-frontend
   flyctl deploy
   ```

4. **Set environment variables:**
   ```bash
   flyctl secrets set VITE_API_URL=https://catalyst-backend.fly.dev -a catalyst-frontend
   ```

**Cost:** Free tier covers most small applications

### Traditional Cloud (GKS, Azure, AWS)

While more expensive, traditional cloud providers offer enterprise features:

#### Google Kubernetes Engine (GKS)
- **Pros:** Scalability, managed Kubernetes, Google Cloud ecosystem
- **Cons:** Expensive (~$70/month minimum), complex setup
- **Best for:** Large-scale applications, enterprise requirements

#### Azure App Service
- **Pros:** Integration with Microsoft ecosystem, easy scaling
- **Cons:** Expensive (~$13/month per service), vendor lock-in
- **Best for:** Teams already using Azure, Windows-based workflows

#### AWS ECS/EKS
- **Pros:** Comprehensive AWS ecosystem, fine-grained control
- **Cons:** Complex pricing, steep learning curve
- **Best for:** Complex architectures, teams with AWS expertise

## Production Considerations

### Environment Variables

Ensure proper environment variables for production:

**Backend:**
```env
PORT=8011
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.com
```

### Security

1. **CORS Configuration:** Update backend to restrict CORS origins
2. **Environment Variables:** Never commit secrets to Git
3. **HTTPS:** Ensure all platforms use HTTPS (Koyeb, Render, etc. provide this automatically)

### Monitoring

Consider adding:
- Health check endpoints (already available at `/health`)
- Error tracking (Sentry, LogRocket)
- Uptime monitoring (UptimeRobot, Pingdom)

### Scaling Considerations

| Platform | Auto-scaling | Manual Scaling | Cost Impact |
|----------|-------------|----------------|-------------|
| Koyeb | ✅ Automatic | ✅ Available | Pay per instance |
| Render | ❌ No | ✅ Available | Fixed per tier |
| Railway | ✅ Automatic | ✅ Available | Pay per usage |
| Fly.io | ✅ Automatic | ✅ Available | Pay per instance |

## Recommendations

**For Development/Prototyping:**
- **Best:** Koyeb or Fly.io (Free tier)
- **Alternative:** Railway ($5 free credit)

**For Production (Low-Traffic):**
- **Best:** Koyeb ($0-10/month)
- **Alternative:** Render ($7/month)

**For Production (High-Traffic):**
- **Best:** Fly.io or Railway (auto-scaling)
- **Alternative:** AWS/GCP (if you need specific cloud features)

**For Enterprise:**
- **Best:** GKS, Azure, or AWS (based on existing infrastructure)

## Quick Start with Koyeb

The fastest way to deploy Catalyst to Koyeb:

```bash
# 1. Fork or clone this repository
# 2. Sign up at https://www.koyeb.com
# 3. Click "Create Service" → "GitHub"
# 4. Select this repository
# 5. Deploy backend (backend/Dockerfile, port 8011)
# 6. Deploy frontend (frontend/Dockerfile, port 80)
# 7. Update frontend's VITE_API_URL to point to backend
# 8. Done! Both services running on free tier
```

## Support

For deployment issues:
- Koyeb: [docs.koyeb.com](https://docs.koyeb.com)
- Render: [render.com/docs](https://render.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Fly.io: [fly.io/docs](https://fly.io/docs)
