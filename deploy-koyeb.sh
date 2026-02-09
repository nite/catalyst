#!/bin/bash

# Catalyst Koyeb Deployment Script
# Deploys Catalyst to Koyeb using the CLI

set -e  # Exit on error

echo "🚀 Catalyst Koyeb Deployment"
echo "=============================="
echo ""

# Check if koyeb CLI is installed
if ! command -v koyeb &> /dev/null; then
    echo "❌ Koyeb CLI not found!"
    echo ""
    echo "Please install Koyeb CLI first:"
    echo "  macOS:  brew install koyeb/tap/koyeb-cli"
    echo "  Linux:  curl -fsSL https://cli.koyeb.com/install.sh | sh"
    echo ""
    echo "Then login: koyeb login"
    exit 1
fi

# Check if logged in
if ! koyeb app list &> /dev/null; then
    echo "❌ Not logged in to Koyeb!"
    echo ""
    echo "Please login first: koyeb login"
    exit 1
fi

echo "✅ Koyeb CLI is installed and authenticated"
echo ""

# Configuration
APP_NAME="${KOYEB_APP_NAME:-catalyst}"
SERVICE_NAME="${KOYEB_SERVICE_NAME:-catalyst-app}"
GIT_REPO="${KOYEB_GIT_REPO:-github.com/nite/catalyst}"
GIT_BRANCH="${KOYEB_GIT_BRANCH:-main}"
INSTANCE_TYPE="${KOYEB_INSTANCE_TYPE:-nano}"
PORT="${KOYEB_PORT:-8000}"

echo "📋 Deployment Configuration:"
echo "  App Name:      $APP_NAME"
echo "  Service Name:  $SERVICE_NAME"
echo "  Repository:    $GIT_REPO"
echo "  Branch:        $GIT_BRANCH"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  Port:          $PORT"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔨 Creating Koyeb app..."

# Check if app exists
if koyeb app get "$APP_NAME" &> /dev/null; then
    echo "✅ App '$APP_NAME' already exists"
else
    echo "Creating new app '$APP_NAME'..."
    koyeb app create "$APP_NAME"
    echo "✅ App created"
fi

echo ""
echo "🚀 Deploying service..."

# Check if service exists
if koyeb service get "$SERVICE_NAME" &> /dev/null; then
    echo "Service '$SERVICE_NAME' exists, updating..."
    koyeb service update "$SERVICE_NAME" \
        --git "$GIT_REPO" \
        --git-branch "$GIT_BRANCH" \
        --git-builder docker \
        --docker-dockerfile Dockerfile
else
    echo "Creating new service '$SERVICE_NAME'..."
    koyeb service create "$SERVICE_NAME" \
        --app "$APP_NAME" \
        --git "$GIT_REPO" \
        --git-branch "$GIT_BRANCH" \
        --git-builder docker \
        --docker-dockerfile Dockerfile \
        --ports "$PORT:http" \
        --routes "/:$PORT" \
        --instance-type "$INSTANCE_TYPE" \
        --env "PORT=$PORT" \
        --health-checks "http:$PORT:/health"
fi

echo ""
echo "⏳ Deployment in progress..."
echo ""
echo "You can monitor the deployment with:"
echo "  koyeb service logs $SERVICE_NAME -f"
echo ""
echo "Or check status with:"
echo "  koyeb service get $SERVICE_NAME"
echo ""

# Wait for deployment to complete (optional)
read -p "Wait for deployment to complete? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Waiting for service to be ready..."
    
    # Poll service status
    max_attempts=60
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Try to use jq if available, otherwise fallback to grep
        if command -v jq &> /dev/null; then
            status=$(koyeb service get "$SERVICE_NAME" --output json 2>/dev/null | jq -r '.status // "unknown"')
        else
            status=$(koyeb service get "$SERVICE_NAME" --output json 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
        fi
        
        if [ "$status" = "healthy" ]; then
            echo ""
            echo "✅ Service is healthy!"
            break
        elif [ "$status" = "error" ]; then
            echo ""
            echo "❌ Service deployment failed!"
            echo ""
            echo "Check logs with: koyeb service logs $SERVICE_NAME"
            exit 1
        else
            echo -n "."
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -ge $max_attempts ]; then
        echo ""
        echo "⚠️  Timeout waiting for service to be ready"
        echo "Check status manually: koyeb service get $SERVICE_NAME"
    fi
fi

echo ""
echo "🎉 Deployment initiated successfully!"
echo ""

# Get service URL
if command -v jq &> /dev/null; then
    SERVICE_URL=$(koyeb service get "$SERVICE_NAME" --output json 2>/dev/null | jq -r '.public_domain // ""')
else
    SERVICE_URL=$(koyeb service get "$SERVICE_NAME" --output json 2>/dev/null | grep -o '"public_domain":"[^"]*"' | cut -d'"' -f4 || echo "")
fi

if [ -n "$SERVICE_URL" ]; then
    echo "🌐 Your app will be available at:"
    echo "  https://$SERVICE_URL"
    echo ""
    echo "📊 API Documentation:"
    echo "  https://$SERVICE_URL/docs"
    echo ""
fi

echo "📝 Useful commands:"
echo "  View logs:    koyeb service logs $SERVICE_NAME -f"
echo "  Get status:   koyeb service get $SERVICE_NAME"
echo "  Redeploy:     koyeb service redeploy $SERVICE_NAME"
echo "  Delete:       koyeb service delete $SERVICE_NAME"
echo ""
echo "✨ Done!"
