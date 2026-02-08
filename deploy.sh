#!/bin/bash
#
# Catalyst Render Deployment Script
# Deploys both backend and frontend to Render
#

set -e

echo "=========================================="
echo "Catalyst Deployment to Render"
echo "=========================================="
echo ""

# Check if RENDER_API_KEY is set
if [ -z "$RENDER_API_KEY" ]; then
    echo "Error: RENDER_API_KEY environment variable is not set"
    echo ""
    echo "To deploy, you need a Render API key:"
    echo "1. Go to https://dashboard.render.com/account/settings"
    echo "2. Click 'Generate New API Key' under API Keys section"
    echo "3. Copy the key and set it:"
    echo "   export RENDER_API_KEY='rnd_your_api_key_here'"
    echo ""
    exit 1
fi

# Install PyYAML if needed
echo "Installing dependencies..."
pip install -q PyYAML requests 2>/dev/null || true

# Run the Python deployment script
echo ""
echo "Starting deployment..."
echo ""

python3 deploy_render.py

echo ""
echo "Deployment complete!"
echo ""
echo "Note: Your services are now building on Render."
echo "It may take 5-10 minutes for them to become available."
echo ""
echo "Check status at: https://dashboard.render.com/services"
echo ""
