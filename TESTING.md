# Manual Testing Guide for Catalyst

This guide provides step-by-step instructions for manually testing the Catalyst data visualization platform.

## Prerequisites

- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:3000`

## Test Suite

### 1. Backend API Testing

#### Test Health Endpoint
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

#### Test Dataset Listing
```bash
curl http://localhost:8000/api/v1/datasets | jq
# Expected: Array of 15+ datasets with metadata
```

#### Test Small Dataset (Client-side Strategy)
```bash
curl "http://localhost:8000/api/v1/datasets/census-population-estimates/data" | jq '.suggested_strategy'
# Expected: "client"
```

#### Test Dataset Analysis
```bash
curl -X POST "http://localhost:8000/api/v1/datasets/census-population-estimates/analyze" | jq '.recommended_chart'
# Expected: Chart type like "map", "bar", etc.
```

#### Test Server-side Aggregation
```bash
curl -X POST "http://localhost:8000/api/v1/datasets/census-population-estimates/aggregate" \
  -H "Content-Type: application/json" \
  -d '{"group_by":["state"],"aggregations":{"population":"sum"},"limit":5}' | jq
# Expected: Aggregated data with 5 rows
```

### 2. Frontend Testing

#### Test Homepage
1. Open `http://localhost:3000` in browser
2. Verify:
   - Header shows "Catalyst" and tagline
   - Dataset grid displays 15+ dataset cards
   - Search bar is visible
   - Category filters are visible

#### Test Dataset Search
1. Type "covid" in search bar
2. Verify:
   - Only COVID-related datasets show
   - Results update in real-time

#### Test Category Filtering
1. Click on "Economics" category
2. Verify:
   - Only economics datasets show
   - Button is highlighted

#### Test Dataset Visualization
1. Click on "US Population Estimates" dataset
2. Verify:
   - Page navigates to dataset view
   - Data stats show (Total rows, Displayed, Size)
   - "Client-side" or "Server-side" badge appears
   - Chart renders (ECharts visualization)
   - Filters appear below chart
   - Data preview table shows at bottom

#### Test Client-side Filtering (Small Dataset)
1. Open "US Population Estimates" (small dataset)
2. Verify "Client-side" badge is shown
3. Apply a filter (e.g., select California in state filter)
4. Verify:
   - Chart updates instantly (no loading spinner)
   - Data preview updates
   - DuckDB Active indicator shows (⚡ DuckDB Active)

#### Test Multiple Filters
1. On same dataset, apply multiple filters:
   - Select 2-3 states
   - Set population range
2. Verify:
   - Chart updates to show only filtered data
   - Data count updates correctly

#### Test Filter Reset
1. Click "Reset Filters" button
2. Verify:
   - All filters clear
   - Chart shows full dataset again

### 3. Mobile Testing

#### Test Responsive Design
1. Open browser DevTools
2. Switch to mobile view (iPhone 12 Pro or similar)
3. Verify:
   - Layout adjusts to mobile
   - Touch targets are large enough
   - Charts are readable
   - Category filters scroll horizontally

#### Test Touch Interactions
1. On mobile view:
   - Swipe through category filters
   - Tap on dataset cards
   - Pinch to zoom on charts (if supported)
   - Scroll through data table

### 4. Performance Testing

#### Test Small Dataset Performance
1. Open "US Census" dataset (~5k rows)
2. Measure:
   - Initial load time (should be < 1 second)
   - Filter application time (should be instant)
   - Chart render time (should be < 500ms)

#### Test Caching
1. Open a dataset
2. Navigate back to homepage
3. Open same dataset again
4. Verify:
   - Second load is faster (cached)
   - Check browser DevTools Network tab - should show cached response

### 5. API Integration Testing

**Note:** These require network access to external APIs

#### Test World Bank Integration
```bash
# Run this manually if you have network access
curl "http://localhost:8000/api/v1/datasets/wb-gdp-per-capita/data?limit=10" | jq
# Expected: Real data from World Bank API
```

#### Test Data.gov Integration (Socrata)
```bash
# Test with a Socrata dataset
curl "http://localhost:8000/api/v1/datasets/sf-police-incidents/data?limit=10" | jq
# Expected: Real police incident data from San Francisco
```

## Expected Test Results

### ✅ Success Criteria

- [ ] All backend API endpoints return 200 status
- [ ] 15+ datasets are available
- [ ] Small datasets use "client" strategy
- [ ] Charts render correctly using ECharts
- [ ] Filters work instantly on client-side datasets
- [ ] Data preview table updates with filters
- [ ] Mobile layout is responsive
- [ ] Application works offline after initial load (cached datasets)

### 🔍 Known Issues

- External API tests are skipped in automated tests (require network)
- Some large datasets may timeout if external APIs are slow
- DuckDB-WASM initialization may take a few seconds on first load

## Troubleshooting

### Backend Not Starting
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Not Starting
```bash
cd frontend
npm install
npm run dev
```

### CORS Errors
- Check that backend CORS settings allow frontend origin
- Default allows all origins ("*") for development

### DuckDB Not Loading
- Check browser console for errors
- Ensure WebAssembly is supported in browser
- Try in Chrome/Edge for best compatibility

## Automated Test Commands

```bash
# Backend tests
cd backend
pytest app/tests/ -v

# Frontend tests (when implemented)
cd frontend
npm test
```
