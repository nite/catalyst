#!/bin/bash
# Render Blueprint Validation and Deployment Test Script

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         RENDER BLUEPRINT VALIDATION & DEPLOYMENT TEST           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Validating render.yaml syntax"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 -c "import yaml; yaml.safe_load(open('render.yaml'))"
print_status $? "YAML syntax is valid"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking directory structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -d api && test -f api/requirements.txt
print_status $? "API directory and requirements.txt exist"

test -d api/app && test -f api/app/main.py
print_status $? "API app structure exists"

test -d web && test -f web/package.json
print_status $? "Web directory and package.json exist"

test -f web/vite.config.js
print_status $? "Web vite.config.js exists"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Validating api configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check health endpoint exists
grep -q "def health_check" api/app/main.py
print_status $? "Health check endpoint exists"

grep -q "/health" api/app/main.py
print_status $? "Health check path is /health"

# Check FastAPI is in requirements
grep -q "fastapi" api/requirements.txt
print_status $? "FastAPI is in requirements.txt"

grep -q "uvicorn" api/requirements.txt
print_status $? "Uvicorn is in requirements.txt"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Validating web configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check build script exists
grep -q '"build"' web/package.json
print_status $? "Build script exists in package.json"

grep -q "vite build" web/package.json
print_status $? "Vite build command configured"

# Check index.html exists
test -f web/index.html
print_status $? "index.html exists"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Render Blueprint specification validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 << 'PYEOF'
import yaml
import sys

with open('render.yaml', 'r') as f:
    config = yaml.safe_load(f)

errors = []
warnings = []

services = config.get('services', [])

# Check api service
api = services[0]
if api.get('type') != 'web':
    errors.append("API type should be 'web'")
if api.get('env') != 'python':
    errors.append("API env should be 'python'")
if not api.get('buildCommand'):
    errors.append("API missing buildCommand")
if not api.get('startCommand'):
    errors.append("API missing startCommand")
if not api.get('healthCheckPath'):
    warnings.append("API missing healthCheckPath (recommended)")

# Check web service
web = services[1]
if web.get('type') != 'web':
    errors.append("Web type should be 'web'")
if web.get('env') != 'static':
    errors.append("Web env should be 'static'")
if not web.get('buildCommand'):
    errors.append("Web missing buildCommand")
if not web.get('staticPublishPath'):
    errors.append("Web missing staticPublishPath")
if 'region' in web:
    errors.append("Web (static site) should NOT have a 'region' field")

# Check environment variable references
web_env = web.get('envVars', [])
for var in web_env:
    if 'fromService' in var:
        ref_service = var['fromService'].get('name')
        if ref_service != api.get('name'):
            errors.append(f"Web references non-existent service: {ref_service}")

if errors:
    print("❌ ERRORS FOUND:")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)

if warnings:
    print("⚠️  WARNINGS:")
    for warn in warnings:
        print(f"  - {warn}")

if not errors and not warnings:
    print("✅ All Render Blueprint checks passed!")
    
sys.exit(0)
PYEOF

print_status $? "Render Blueprint specification is valid"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Testing build commands (dry-run)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_info "API build command: cd api && pip install -r requirements.txt"
print_info "API start command: cd api && uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
print_info "Web build command: cd web && npm install && npm run build"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                     VALIDATION COMPLETE ✅                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "The render.yaml configuration is valid and ready for deployment!"
echo ""
echo "Next steps:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click 'New' → 'Blueprint'"
echo "  3. Select repository: nite/catalyst"
echo "  4. Select branch: copilot/add-catalyst-data-visualization"
echo "  5. Click 'Apply'"
echo ""
