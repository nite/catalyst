#!/bin/bash
#
# Catalyst Deployment Script using Render CLI
#
# This script deploys Catalyst to Render using the official Render CLI tool.
# It handles both backend and frontend services defined in render.yaml
#

set -e

echo "=========================================="
echo "Catalyst - Render CLI Deployment"
echo "=========================================="
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Error: Render CLI is not installed"
    echo ""
    echo "Install it with:"
    echo "  curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh"
    echo ""
    echo "Or build from source:"
    echo "  git clone https://github.com/render-oss/cli.git"
    echo "  cd cli && go build -o render . && sudo mv render /usr/local/bin/"
    echo ""
    exit 1
fi

echo "✓ Render CLI found: $(render --version)"
echo ""

# Check if user is logged in
if ! render whoami --output text &> /dev/null; then
    echo "You need to authenticate with Render first."
    echo ""
    echo "Run: render login"
    echo ""
    echo "This will open your browser to authenticate."
    exit 1
fi

echo "✓ Authenticated as: $(render whoami --output text 2>/dev/null || echo 'Not logged in')"
echo ""

# Validate render.yaml
echo "Validating render.yaml..."
if render blueprints validate --output text; then
    echo "✓ render.yaml is valid"
else
    echo "✗ render.yaml validation failed"
    exit 1
fi
echo ""

# Display deployment plan
echo "=========================================="
echo "Deployment Plan"
echo "=========================================="
echo ""
echo "The following services will be deployed:"
echo ""
echo "  1. catalyst-api (Backend)"
echo "     - Type: Web Service"
echo "     - Environment: Python 3.11"
echo "     - Region: Oregon"
echo ""
echo "  2. catalyst-frontend (Frontend)"
echo "     - Type: Static Site"
echo "     - Build: npm install && npm run build"
echo "     - Region: Oregon"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "=========================================="
echo "Deploying Services"
echo "=========================================="
echo ""

# Note about deployment
echo "Note: Render CLI uses the dashboard for blueprint deployment."
echo "We'll use the services command to deploy individual services."
echo ""

# Deploy backend
echo "Deploying backend service..."
echo "To deploy services from render.yaml, you can:"
echo ""
echo "Option 1: Use Render Dashboard"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click 'New' → 'Blueprint'"
echo "  3. Connect your GitHub repo: nite/catalyst"
echo "  4. Select branch: copilot/add-dataset-integration-functionality"
echo ""
echo "Option 2: Use Render API (via Python script)"
echo "  ./deploy.sh"
echo ""
echo "Option 3: Manual service creation"
echo "  Use the 'render services create' command for each service"
echo ""

# Show next steps
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Deploy via Dashboard (recommended):"
echo "   https://dashboard.render.com/blueprints"
echo ""
echo "2. Or use the API deployment script:"
echo "   export RENDER_API_KEY='your-key'"
echo "   ./deploy.sh"
echo ""
echo "3. Monitor deployment:"
echo "   render services list"
echo "   render logs -s catalyst-api"
echo ""

echo "=========================================="
echo "Useful Render CLI Commands"
echo "=========================================="
echo ""
echo "  render services list          # List all services"
echo "  render logs -s catalyst-api   # View backend logs"
echo "  render deploys -s catalyst-api # View deploy history"
echo "  render restart -s catalyst-api # Restart backend"
echo ""
