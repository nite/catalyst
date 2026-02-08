#!/bin/bash
#
# Render Deployment Verification Script
# Checks if Catalyst is deployed and working on Render
#

echo "=========================================="
echo "Catalyst Deployment Verification"
echo "=========================================="
echo ""

# Expected URLs
BACKEND_URL="https://catalyst-api.onrender.com"
FRONTEND_URL="https://catalyst-frontend.onrender.com"

echo "Checking deployment status..."
echo ""

# Test Backend Health
echo "1. Testing Backend API..."
echo "   URL: $BACKEND_URL/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend is UP and healthy"
    HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "   ❌ Backend not responding (HTTP $BACKEND_STATUS)"
fi
echo ""

# Test Backend API Docs
echo "2. Testing Backend API Docs..."
echo "   URL: $BACKEND_URL/docs"
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/docs" 2>/dev/null || echo "000")

if [ "$DOCS_STATUS" = "200" ]; then
    echo "   ✅ API Documentation is accessible"
else
    echo "   ⚠️  API Docs status: HTTP $DOCS_STATUS"
fi
echo ""

# Test Backend Datasets Endpoint
echo "3. Testing Datasets API..."
echo "   URL: $BACKEND_URL/api/v1/datasets"
DATASETS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/datasets" 2>/dev/null || echo "000")

if [ "$DATASETS_STATUS" = "200" ]; then
    echo "   ✅ Datasets API is working"
    DATASET_COUNT=$(curl -s "$BACKEND_URL/api/v1/datasets" | grep -o '"id"' | wc -l)
    echo "   Available datasets: $DATASET_COUNT"
else
    echo "   ❌ Datasets API not responding (HTTP $DATASETS_STATUS)"
fi
echo ""

# Test Frontend
echo "4. Testing Frontend..."
echo "   URL: $FRONTEND_URL"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is accessible"
    # Check if it contains Catalyst
    if curl -s "$FRONTEND_URL" | grep -q "Catalyst"; then
        echo "   ✅ Frontend content verified"
    fi
else
    echo "   ❌ Frontend not responding (HTTP $FRONTEND_STATUS)"
fi
echo ""

# Summary
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🌐 Your application is live:"
    echo "   Backend:  $BACKEND_URL"
    echo "   Frontend: $FRONTEND_URL"
    echo "   API Docs: $BACKEND_URL/docs"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Visit $FRONTEND_URL"
    echo "   2. Browse the 15+ available datasets"
    echo "   3. Test visualizations and filters"
    echo ""
else
    echo "⚠️  DEPLOYMENT STATUS UNCLEAR"
    echo ""
    echo "If services are still building:"
    echo "   - Backend builds in ~3-5 minutes"
    echo "   - Frontend builds in ~4-6 minutes"
    echo "   - Wait a few minutes and run this script again"
    echo ""
    echo "Check deployment status:"
    echo "   render services list"
    echo "   render logs -s catalyst-api"
    echo ""
fi

echo "=========================================="
