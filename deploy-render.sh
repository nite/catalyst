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
        PYTHON_BIN="python3"
        if [ -x "./backend/.venv/bin/python" ]; then
            PYTHON_BIN="./backend/.venv/bin/python"
        fi
        "$PYTHON_BIN" << 'PYEOF'
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
        echo "Deploying services to Render..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""

        SERVICES_JSON=$(render services --output json || true)
        if [ -z "$SERVICES_JSON" ] || [ "$SERVICES_JSON" = "null" ]; then
            if [ -n "$RENDER_API_KEY" ]; then
                echo "No services found. Creating services via Render API..."
                OWNER_JSON=$(render workspace current --output json)
                OWNER_ID=$(OWNER_JSON="$OWNER_JSON" "$PYTHON_BIN" << 'PYEOF'
import json
import os
import sys

data = json.loads(os.environ.get("OWNER_JSON", "{}"))
owner_id = data.get("id")
if not owner_id:
    sys.exit(2)
print(owner_id)
PYEOF
                )

                if [ -z "$OWNER_ID" ]; then
                    echo -e "${RED}❌ Unable to determine Render workspace ID${NC}"
                    exit 1
                fi

                REPO_URL=$(git remote get-url origin)
                BRANCH_NAME=$(git branch --show-current)

                OWNER_ID="$OWNER_ID" REPO_URL="$REPO_URL" BRANCH_NAME="$BRANCH_NAME" \
                RENDER_API_KEY="$RENDER_API_KEY" "$PYTHON_BIN" << 'PYEOF'
import json
import os
import sys

import requests
import yaml

owner_id = os.environ.get("OWNER_ID")
repo_url = os.environ.get("REPO_URL")
branch = os.environ.get("BRANCH_NAME")
api_key = os.environ.get("RENDER_API_KEY")

if not all([owner_id, repo_url, branch, api_key]):
    print("Missing OWNER_ID, REPO_URL, BRANCH_NAME, or RENDER_API_KEY")
    sys.exit(2)

with open("render.yaml", "r") as handle:
    config = yaml.safe_load(handle) or {}

services = config.get("services", [])
if not services:
    print("No services defined in render.yaml")
    sys.exit(2)

headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}",
}

def env_vars_from_yaml(env_vars):
    output = []
    for item in env_vars or []:
        key = item.get("key")
        value = item.get("value")
        if key and value is not None:
            output.append({"key": key, "value": value})
    return output

def create_service(payload):
    resp = requests.post("https://api.render.com/v1/services", headers=headers, data=json.dumps(payload))
    if resp.status_code in (200, 201, 202):
        return resp.json()
    if resp.status_code == 409:
        return {"conflict": True, "detail": resp.text}
    print(resp.text)
    resp.raise_for_status()

for svc in services:
    svc_type = svc.get("type")
    name = svc.get("name")
    if not svc_type or not name:
        continue

    if svc_type == "web":
        payload = {
            "type": "web_service",
            "name": name,
            "ownerId": owner_id,
            "repo": repo_url,
            "branch": branch,
            "rootDir": ".",
            "envVars": env_vars_from_yaml(svc.get("envVars")),
            "serviceDetails": {
                "runtime": svc.get("env") or "python",
                "region": svc.get("region") or "oregon",
                "healthCheckPath": svc.get("healthCheckPath"),
                "envSpecificDetails": {
                    "buildCommand": svc.get("buildCommand"),
                    "startCommand": svc.get("startCommand"),
                },
            },
        }
    elif svc_type == "static":
        env_vars = env_vars_from_yaml(svc.get("envVars"))
        if not env_vars:
            env_vars = [{"key": "VITE_API_URL", "value": "https://catalyst-api.onrender.com"}]

        previews = "yes" if svc.get("pullRequestPreviewsEnabled") else "no"
        payload = {
            "type": "static_site",
            "name": name,
            "ownerId": owner_id,
            "repo": repo_url,
            "branch": branch,
            "rootDir": ".",
            "envVars": env_vars,
            "serviceDetails": {
                "buildCommand": svc.get("buildCommand"),
                "publishPath": svc.get("staticPublishPath"),
                "pullRequestPreviewsEnabled": previews,
                "headers": svc.get("headers") or [],
                "routes": svc.get("routes") or [],
            },
        }
    else:
        print(f"Skipping unsupported service type: {svc_type}")
        continue

    print(f"Creating service: {name}")
    result = create_service(payload)
    if result and result.get("conflict"):
        print(f"Service already exists: {name}")

print("Service creation request(s) submitted.")
PYEOF

                SERVICES_JSON=$(render services --output json || true)
            else
                echo -e "${YELLOW}⚠️  No services found in the active workspace${NC}"
                echo ""
                echo "To create services from render.yaml, use the Render Dashboard:"
                echo "  1) https://dashboard.render.com"
                echo "  2) New → Blueprint → Select this repo/branch"
                echo "  3) Apply"
                echo ""
                echo "After services exist, re-run this script to trigger deploys."
                exit 1
            fi
        fi

        SERVICE_LINES=$(SERVICES_JSON="$SERVICES_JSON" "$PYTHON_BIN" << 'PYEOF'
import json
import os
import sys

raw = os.environ.get("SERVICES_JSON", "")
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    sys.exit(2)

if not isinstance(data, list):
    sys.exit(3)

targets = {"catalyst-api", "catalyst-frontend"}
found = []
for svc in data:
    name = svc.get("name")
    sid = svc.get("id")
    if name in targets and sid:
        found.append(f"{name}:{sid}")

print("\n".join(found))
PYEOF
        )

        if [ -z "$SERVICE_LINES" ]; then
            echo -e "${YELLOW}⚠️  Services not found in workspace:${NC} catalyst-api, catalyst-frontend"
            echo ""
            echo "Create them from render.yaml in the Render Dashboard, then re-run."
            exit 1
        fi

        MISSING=0
        for expected in catalyst-api catalyst-frontend; do
            if ! echo "$SERVICE_LINES" | grep -q "^${expected}:"; then
                echo -e "${YELLOW}⚠️  Missing service:${NC} $expected"
                MISSING=1
            fi
        done
        if [ "$MISSING" -eq 1 ]; then
            echo ""
            echo "Create missing services from render.yaml in the Render Dashboard, then re-run."
            exit 1
        fi

        while IFS= read -r line; do
            svc_name=${line%%:*}
            svc_id=${line#*:}
            echo "Triggering deploy for $svc_name..."
            render deploys create "$svc_id" --confirm --wait
        done <<< "$SERVICE_LINES"
        
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
