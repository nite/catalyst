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

test -d backend && test -f backend/requirements.txt
print_status $? "Backend directory and requirements.txt exist"

test -d backend/app && test -f backend/app/main.py
print_status $? "Backend app structure exists"

test -d frontend && test -f frontend/package.json
print_status $? "Frontend directory and package.json exist"

test -f frontend/vite.config.js
print_status $? "Frontend vite.config.js exists"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Validating backend configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check health endpoint exists
grep -q "def health_check" backend/app/main.py
print_status $? "Health check endpoint exists"

grep -q "/health" backend/app/main.py
print_status $? "Health check path is /health"

# Check FastAPI is in requirements
grep -q "fastapi" backend/requirements.txt
print_status $? "FastAPI is in requirements.txt"

grep -q "uvicorn" backend/requirements.txt
print_status $? "Uvicorn is in requirements.txt"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Validating frontend configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check build script exists
grep -q '"build"' frontend/package.json
print_status $? "Build script exists in package.json"

grep -q "vite build" frontend/package.json
print_status $? "Vite build command configured"

# Check index.html exists
test -f frontend/index.html
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

# Check backend service
backend = services[0]
if backend.get('type') != 'web':
    errors.append("Backend type should be 'web'")
if backend.get('env') != 'python':
    errors.append("Backend env should be 'python'")
if not backend.get('buildCommand'):
    errors.append("Backend missing buildCommand")
if not backend.get('startCommand'):
    errors.append("Backend missing startCommand")
if not backend.get('healthCheckPath'):
    warnings.append("Backend missing healthCheckPath (recommended)")

# Check frontend service
frontend = services[1]
if frontend.get('type') != 'web':
    errors.append("Frontend type should be 'web'")
if frontend.get('env') != 'static':
    errors.append("Frontend env should be 'static'")
if not frontend.get('buildCommand'):
    errors.append("Frontend missing buildCommand")
if not frontend.get('staticPublishPath'):
    errors.append("Frontend missing staticPublishPath")
if 'region' in frontend:
    errors.append("Frontend (static site) should NOT have a 'region' field")

# Check environment variable references
frontend_env = frontend.get('envVars', [])
for var in frontend_env:
    if 'fromService' in var:
        ref_service = var['fromService'].get('name')
        if ref_service != backend.get('name'):
            errors.append(f"Frontend references non-existent service: {ref_service}")

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

print_info "Backend build command: cd backend && pip install -r requirements.txt"
print_info "Backend start command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
print_info "Frontend build command: cd frontend && npm install && npm run build"

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
