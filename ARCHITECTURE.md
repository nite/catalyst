# Catalyst Architecture

## System Overview

Catalyst is a mobile-first data visualization platform that intelligently processes data either client-side or server-side based on dataset size.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                     (React + TailwindCSS)                    │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Dataset   │  │ Visualization│  │   Filters    │        │
│  │  Browser   │  │   Display    │  │  & Controls  │        │
│  └────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ REST API (AJAX)
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│   Client-Side    │      │   Server-Side    │
│   Processing     │      │   Processing     │
│                  │      │                  │
│  DuckDB-WASM     │      │  FastAPI +       │
│  - SQL Queries   │      │  Pandas          │
│  - Aggregation   │      │  - Pre-aggregate │
│  - Filtering     │      │  - Sample data   │
│                  │      │  - Smart queries │
└──────────────────┘      └─────────┬────────┘
          │                         │
          │                         ▼
          │              ┌───────────────────┐
          │              │  External APIs    │
          │              │                   │
          │              │ • Data.gov        │
          │              │ • World Bank      │
          │              │ • Our World Data  │
          │              │ • NOAA            │
          │              │ • US Census       │
          │              └───────────────────┘
          │
          ▼
┌──────────────────┐
│   IndexedDB      │
│   Cache          │
│                  │
│ • Full datasets  │
│ • Offline mode   │
└──────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── Header.jsx                 # App header with branding
│   ├── DatasetBrowser.jsx         # Browse and search datasets
│   ├── DatasetVisualization.jsx   # Main visualization view
│   ├── ChartRenderer.jsx          # ECharts chart rendering
│   └── DataFilters.jsx            # Interactive filter controls
├── services/
│   ├── api.js                     # Backend API client
│   ├── duckdb.js                  # DuckDB-WASM integration
│   └── cache.js                   # IndexedDB caching
└── App.jsx                        # Main app component
```

### Backend Structure

```
app/
├── api/
│   └── datasets.py                # Dataset API endpoints
├── core/
│   ├── config.py                  # App configuration
│   └── models.py                  # Pydantic models
├── services/
│   ├── catalog.py                 # Dataset catalog
│   ├── data_fetcher.py           # Fetch from external APIs
│   ├── analyzer.py               # Data analysis & viz config
│   └── aggregator.py             # Server-side aggregation
└── main.py                        # FastAPI app
```

## Data Flow Patterns

### Pattern 1: Small Dataset (Client-Side)

```
1. User clicks dataset
         │
         ▼
2. Frontend → GET /datasets/{id}/data
         │
         ▼
3. Backend checks size → < 100k rows
         │
         ▼
4. Backend returns full dataset
   { strategy: "client", data: [...] }
         │
         ▼
5. Frontend loads into DuckDB-WASM
         │
         ▼
6. User applies filters
         │
         ▼
7. DuckDB executes SQL locally
   SELECT * FROM data WHERE ...
         │
         ▼
8. Chart updates instantly (0ms latency)
```

### Pattern 2: Large Dataset (Server-Side)

```
1. User clicks dataset
         │
         ▼
2. Frontend → GET /datasets/{id}/data
         │
         ▼
3. Backend checks size → > 100k rows
         │
         ▼
4. Backend pre-aggregates with Pandas
   df.groupby(...).agg(...)
         │
         ▼
5. Backend returns summary
   { strategy: "server", data: [...aggregated] }
         │
         ▼
6. Frontend displays aggregated view
         │
         ▼
7. User applies filters
         │
         ▼
8. Frontend → POST /datasets/{id}/aggregate
   { filters: {...}, group_by: [...] }
         │
         ▼
9. Backend re-aggregates with new filters
         │
         ▼
10. Chart updates (200-500ms latency)
```

## Technology Choices

### Why DuckDB-WASM?

- ✅ In-browser SQL engine (no server round trips)
- ✅ Handles 100k+ rows efficiently
- ✅ Native SQL syntax for complex queries
- ✅ WebAssembly performance
- ❌ ~2MB download size (acceptable trade-off)

### Why Apache ECharts?

- ✅ Mobile-optimized out of the box
- ✅ Touch-friendly interactions
- ✅ Handles millions of data points
- ✅ WebGL rendering option
- ✅ Extensive chart types
- ❌ Larger bundle than lightweight libs (acceptable for features)

### Why Pandas for Server-Side?

- ✅ Industry standard for Python data processing
- ✅ Extremely efficient for aggregations
- ✅ Rich API for transformations
- ✅ Handles multi-million row datasets
- ❌ Requires more server memory (acceptable for aggregation use case)

## Performance Characteristics

### Client-Side Processing

| Metric | Value | Notes |
|--------|-------|-------|
| Max Dataset Size | 100k rows / 5MB | Configurable threshold |
| Filter Latency | 0-10ms | Instant updates |
| Initial Load | 1-3s | Includes DuckDB init |
| Memory Usage | 50-200MB | Browser dependent |

### Server-Side Processing

| Metric | Value | Notes |
|--------|-------|-------|
| Max Dataset Size | Unlimited | Limited by external API |
| Filter Latency | 200-500ms | Network + computation |
| Aggregation Speed | 100k rows/sec | Pandas performance |
| Memory Usage | Minimal client | Server handles heavy lifting |

## Scalability Considerations

### Frontend Scalability

- **Caching Strategy**: IndexedDB stores datasets locally
- **Code Splitting**: Lazy load DuckDB and ECharts
- **Progressive Loading**: Show UI before full data loads
- **Service Worker**: Could add for full PWA support

### Backend Scalability

- **Horizontal Scaling**: Stateless API can scale horizontally
- **Caching**: Could add Redis for frequently accessed datasets
- **Rate Limiting**: Should add for production
- **CDN**: Static frontend served from CDN

## Security Considerations

- **CORS**: Configured for frontend origin
- **API Keys**: Support for provider API keys (optional)
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection**: DuckDB-WASM uses parameterized queries
- **Rate Limiting**: Not implemented (add for production)

## Deployment Architecture (Render)

```
┌─────────────────────────────────────────┐
│           render.yaml                    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  Frontend   │  │   Backend    │
│  (Static)   │  │  (Web Svc)   │
│             │  │              │
│ - Vite      │  │ - FastAPI    │
│ - Build CDN │  │ - Uvicorn    │
│ - React     │  │ - Python 3.11│
└─────────────┘  └──────────────┘
      │                  │
      └─────┬────────────┘
            │
            ▼
    ┌──────────────┐
    │   External   │
    │     APIs     │
    └──────────────┘
```

## Future Enhancements

1. **WebGL Acceleration**: For very large scatter plots
2. **Streaming Data**: Real-time dataset updates
3. **Collaborative Features**: Share visualizations
4. **Export Options**: PDF, PNG, CSV downloads
5. **Custom Datasets**: User upload capability
6. **Advanced Analytics**: Regression, forecasting
7. **Offline PWA**: Full offline functionality
8. **Data Joins**: Combine multiple datasets

## Configuration Points

### Adjusting Aggregation Thresholds

File: `backend/app/core/config.py`

```python
large_dataset_row_threshold: int = 100000  # Adjust as needed
large_dataset_size_threshold: int = 5 * 1024 * 1024  # 5MB
```

### Adding New Datasets

File: `backend/app/services/catalog.py`

Add to `DATASETS` list with proper metadata.

### Customizing Charts

File: `frontend/src/components/ChartRenderer.jsx`

Modify chart options for different visualizations.
