#!/bin/bash

# Koyeb Deployment Validation Script
# Validates the deployment configuration before deploying

set -e

echo "🔍 Koyeb Deployment Configuration Validation"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
ERRORS=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Check if required files exist
echo "📁 Checking required files..."
if [ -f "Dockerfile" ]; then
    success "Dockerfile exists"
else
    error "Dockerfile not found"
fi

if [ -f "koyeb.yaml" ]; then
    success "koyeb.yaml exists"
else
    warning "koyeb.yaml not found (optional)"
fi

if [ -f ".koyeb/config.yaml" ]; then
    success ".koyeb/config.yaml exists"
else
    warning ".koyeb/config.yaml not found (optional)"
fi

if [ -f "deploy-koyeb.sh" ]; then
    success "deploy-koyeb.sh exists"
    if [ -x "deploy-koyeb.sh" ]; then
        success "deploy-koyeb.sh is executable"
    else
        warning "deploy-koyeb.sh is not executable (run: chmod +x deploy-koyeb.sh)"
    fi
else
    warning "deploy-koyeb.sh not found (optional)"
fi

echo ""

# Validate YAML syntax
echo "📝 Validating YAML files..."
if command -v python3 &> /dev/null; then
    if python3 -c "import yaml" 2>&1 > /dev/null; then
        if [ -f "koyeb.yaml" ]; then
            if python3 -c "import yaml; yaml.safe_load(open('koyeb.yaml'))" 2>&1 > /dev/null; then
                success "koyeb.yaml is valid YAML"
            else
                error "koyeb.yaml has YAML syntax errors"
            fi
        fi
        
        if [ -f ".koyeb/config.yaml" ]; then
            if python3 -c "import yaml; yaml.safe_load(open('.koyeb/config.yaml'))" 2>&1 > /dev/null; then
                success ".koyeb/config.yaml is valid YAML"
            else
                error ".koyeb/config.yaml has YAML syntax errors"
            fi
        fi
    else
        warning "PyYAML not installed, skipping YAML validation"
    fi
else
    warning "Python3 not found, skipping YAML validation"
fi

echo ""

# Check Dockerfile
echo "🐳 Validating Dockerfile..."
if [ -f "Dockerfile" ]; then
    if grep -q "EXPOSE 8000" Dockerfile; then
        success "Port 8000 is exposed in Dockerfile"
    else
        error "Port 8000 not exposed in Dockerfile"
    fi
    
    if grep -q "CMD" Dockerfile || grep -q "ENTRYPOINT" Dockerfile; then
        success "Dockerfile has CMD or ENTRYPOINT"
    else
        error "Dockerfile missing CMD or ENTRYPOINT"
    fi
    
    if grep -q "uvicorn" Dockerfile; then
        success "Uvicorn command found in Dockerfile"
    else
        warning "Uvicorn not found in Dockerfile"
    fi
fi

echo ""

# Check API structure
echo "🔧 Validating API structure..."
if [ -d "api" ]; then
    success "api directory exists"
    
    if [ -f "api/requirements.txt" ]; then
        success "api/requirements.txt exists"
        
        if grep -q "fastapi" api/requirements.txt; then
            success "FastAPI is in requirements.txt"
        else
            error "FastAPI not found in requirements.txt"
        fi
        
        if grep -q "uvicorn" api/requirements.txt; then
            success "Uvicorn is in requirements.txt"
        else
            error "Uvicorn not found in requirements.txt"
        fi
    else
        error "api/requirements.txt not found"
    fi
    
    if [ -f "api/app/main.py" ]; then
        success "api/app/main.py exists"
        
        if grep -q "/health" api/app/main.py; then
            success "Health check endpoint found"
        else
            warning "Health check endpoint not found in main.py"
        fi
    else
        error "api/app/main.py not found"
    fi
else
    error "api directory not found"
fi

echo ""

# Check Web structure
echo "🌐 Validating Web structure..."
if [ -d "web" ]; then
    success "web directory exists"
    
    if [ -f "web/package.json" ]; then
        success "web/package.json exists"
        
        if grep -q '"build"' web/package.json; then
            success "Build script found in package.json"
        else
            error "Build script not found in package.json"
        fi
    else
        error "web/package.json not found"
    fi
else
    error "web directory not found"
fi

echo ""

# Check documentation
echo "📚 Checking documentation..."
if [ -f "KOYEB_DEPLOYMENT.md" ]; then
    success "KOYEB_DEPLOYMENT.md exists"
else
    warning "KOYEB_DEPLOYMENT.md not found"
fi

if [ -f "README.md" ]; then
    if grep -q -i "koyeb" README.md; then
        success "README.md mentions Koyeb"
    else
        warning "README.md doesn't mention Koyeb deployment"
    fi
fi

echo ""
echo "================================================"
echo ""

# Summary
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All validation checks passed!${NC}"
    echo ""
    echo "Your project is ready to deploy to Koyeb."
    echo ""
    echo "Next steps:"
    echo "  1. Deploy via CLI: ./deploy-koyeb.sh"
    echo "  2. Deploy via Dashboard: https://app.koyeb.com/deploy"
    echo "  3. Read full guide: cat KOYEB_DEPLOYMENT.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validation passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Your project should deploy to Koyeb, but review warnings above."
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before deploying to Koyeb."
    exit 1
fi
