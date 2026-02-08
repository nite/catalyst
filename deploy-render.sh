#!/bin/bash
# Render Deployment Script
# Automatically deploys the Catalyst application using Render CLI or API

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              CATALYST - RENDER DEPLOYMENT                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if render CLI is available
if command -v render &> /dev/null; then
    echo -e "${GREEN}✅ Render CLI found${NC}"
    
    # Check if logged in
    if render whoami &> /dev/null; then
        echo -e "${GREEN}✅ Authenticated with Render${NC}"
        echo ""
        
        # Get current directory
        REPO_DIR=$(pwd)
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Deploying from: $REPO_DIR"
        echo "Branch: $(git branch --show-current)"
        echo "Blueprint: render.yaml"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Validate render.yaml first
        echo "Validating render.yaml..."
        python3 << 'PYEOF'
import yaml
try:
    with open('render.yaml', 'r') as f:
        config = yaml.safe_load(f)
    print("✅ render.yaml is valid")
    print(f"   Services: {len(config.get('services', []))}")
    for svc in config.get('services', []):
        print(f"   - {svc.get('name')} ({svc.get('type')})")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
PYEOF
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Deploying Blueprint to Render..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Deploy using render CLI
        # Note: Actual command may vary based on Render CLI version
        # Common options:
        # - render blueprint launch
        # - render deploy
        # - render services create --blueprint render.yaml
        
        # Try the most common command
        if render blueprint launch --help &> /dev/null; then
            echo "Using: render blueprint launch"
            render blueprint launch --yes
        elif render deploy --help &> /dev/null; then
            echo "Using: render deploy"
            render deploy --yes
        elif render services --help &> /dev/null; then
            echo "Using: render services create"
            render services create --blueprint render.yaml
        else
            echo -e "${YELLOW}⚠️  Render CLI found but deployment command unknown${NC}"
            echo ""
            echo "Please run one of these commands manually:"
            echo "  render blueprint launch"
            echo "  render deploy"
            echo "  render services create --blueprint render.yaml"
            echo ""
            echo "Or check Render CLI documentation:"
            echo "  render --help"
            exit 1
        fi
        
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ Deployment initiated!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Monitor deployment status:"
        echo "  - Render Dashboard: https://dashboard.render.com"
        echo "  - CLI: render services list"
        echo ""
        
    else
        echo -e "${RED}❌ Not authenticated with Render${NC}"
        echo ""
        echo "Please log in first:"
        echo "  render login"
        echo ""
        exit 1
    fi
    
else
    echo -e "${YELLOW}⚠️  Render CLI not found in PATH${NC}"
    echo ""
    echo "Options to deploy:"
    echo ""
    echo "1. Install Render CLI:"
    echo "   curl -fsSL https://render.com/install-cli.sh | bash"
    echo "   Then run: render login"
    echo ""
    echo "2. Use Render Dashboard (Manual):"
    echo "   a. Go to: https://dashboard.render.com"
    echo "   b. Click: New → Blueprint"
    echo "   c. Select repo: nite/catalyst"
    echo "   d. Select branch: copilot/add-catalyst-data-visualization"
    echo "   e. Click: Apply"
    echo ""
    echo "3. Use Render API (requires API key):"
    echo "   export RENDER_API_KEY=your_key_here"
    echo "   Then use curl to create blueprint"
    echo ""
    exit 1
fi
