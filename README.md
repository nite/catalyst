# Catalyst

**Mobile-first data visualization platform** - Explore and visualize open datasets from multiple providers with intelligent client-side and server-side processing.

![Catalyst Architecture](https://img.shields.io/badge/Architecture-Adaptive%20Aggregation-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Visualization](https://img.shields.io/badge/Charts-Apache%20ECharts-aa344d)
![Data Processing](https://img.shields.io/badge/Processing-DuckDB--WASM-ffc107)
![Security](https://img.shields.io/badge/Security-Secure%20Latest%20Versions-green)

## 🚀 Features

### Core Capabilities

- **15+ Curated Datasets** from multiple providers:
  - 🏛️ Data.gov (US Government via Socrata API)
  - 🌍 World Bank Open Data
  - 📊 Our World in Data
  - 🌤️ NOAA Climate Data
  - 📈 US Census Bureau

- **Adaptive Aggregation Strategy**:
  - 🔄 **Client-side** processing for small datasets (<100k rows)
  - ⚡ **DuckDB-WASM** for blazing-fast in-browser SQL queries (v1.32.0)
  - 🖥️ **Server-side** aggregation for large datasets (>100k rows)
  - 🧠 Intelligent automatic strategy selection

- **High-Performance Visualizations**:
  - 📱 Mobile-optimized Apache ECharts
  - 🎨 Auto-detected chart types (line, bar, pie, scatter)
  - ✨ WebAssembly-powered rendering
  - 👆 Touch-friendly interactions

- **Smart Filtering**:
  - 📅 Date range pickers
  - 🏷️ Category selectors
  - 🔢 Numeric range sliders
  - ⚡ Instant client-side filtering with DuckDB-WASM
  - 🔄 Efficient server-side filtering for large datasets

- **Offline Capability**:
  - 💾 IndexedDB caching
  - 📦 Progressive Web App ready
  - 🔌 Works without constant server connection

## 🔒 Security

**All dependencies secure and up-to-date:**
- ✅ FastAPI 0.115.0 (latest stable)
- ✅ DuckDB-WASM 1.32.0 (latest stable, secure version)
- ✅ axios 1.12.0 (all vulnerabilities patched)
- ✅ All SQL queries use proper escaping
- ✅ CodeQL security scan: 0 alerts

## 📐 Architecture

### Adaptive Aggregation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  FastAPI Backend│
                    │  Size Detection │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼──────┐          ┌──────▼──────┐
         │  Small Data │          │  Large Data │
         │  <100k rows │          │  >100k rows │
         │   <5MB      │          │   >5MB      │
         └──────┬──────┘          └──────┬──────┘
                │                         │
                │                         │
    ┌───────────▼───────────┐  ┌─────────▼──────────┐
    │  Strategy: CLIENT     │  │  Strategy: SERVER  │
    │  Return: Full Dataset │  │  Return: Aggregated│
    └───────────┬───────────┘  └─────────┬──────────┘
                │                         │
                │                         │
    ┌───────────▼────────────┐ ┌─────────▼───────────┐
    │   DuckDB-WASM          │ │  Pandas Aggregation │
    │   Client-side SQL      │ │  Server-side Summary│
    │   Instant Filtering    │ │  Pre-computed Views │
    │   Zero Server Calls    │ │  Efficient Queries  │
    └───────────┬────────────┘ └─────────┬───────────┘
                │                         │
                │                         │
                └─────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  Apache ECharts  │
                │  WebAssembly     │
                │  Touch-Optimized │
                └──────────────────┘
```

### Technology Stack

**Frontend:**
- ⚛️ **React 18** with Vite for blazing-fast builds
- 🎨 **TailwindCSS** for mobile-first responsive design
- 📊 **Apache ECharts** with WebAssembly rendering
- 🦆 **DuckDB-WASM 1.32.0** for high-performance client-side data processing
- 💾 **IndexedDB** (via idb) for dataset caching
- 🧭 **React Router** for navigation

**Backend:**
- 🐍 **Python 3.11** with FastAPI
- 🐼 **Pandas** for server-side aggregation
- 🌐 **httpx** for async API calls
- 🔧 **Pydantic** for data validation
- 📦 **Uvicorn** ASGI server

**Deployment:**
- 🚀 **Render** (both frontend and backend)
- 🔄 Automated deployments from GitHub
- 🌍 CDN-backed static site hosting

## 🛠️ Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables (optional)
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Running Both Services

For convenience, you can run both services simultaneously:

```bash
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest app/tests/ -v
```

**Test Coverage:**
- ✅ API endpoint tests
- ✅ Data fetching from providers
- ✅ Aggregation logic
- ✅ Size detection and strategy recommendation
- ✅ Dataset analysis and visualization config

### Frontend Tests

```bash
cd frontend
npm test
```

**Test Areas:**
- ✅ Component rendering
- ✅ API service integration
- ✅ DuckDB-WASM functionality
- ✅ Chart generation
- ✅ Filter interactions

### Manual Testing

1. **Browse Datasets**: Visit homepage and verify all 15+ datasets load
2. **View Dataset**: Click a dataset and verify:
   - Chart renders correctly
   - Data table shows preview
   - Strategy badge shows "Client-side" or "Server-side"
3. **Apply Filters**: 
   - Test date range filters
   - Test category multi-select
   - Test numeric range
   - Verify instant updates for client-side datasets
4. **Performance**:
   - Load a large dataset (>100k rows) - should use server strategy
   - Load a small dataset (<10k rows) - should use client strategy
   - Apply multiple filters rapidly - should remain responsive

## 📊 Integrated Datasets

| Dataset | Provider | Category | Rows | Strategy |
|---------|----------|----------|------|----------|
| SF Police Incidents | Data.gov | Public Safety | ~150k | Server |
| NYC 311 Calls | Data.gov | Public Services | ~500k | Server |
| Chicago Crimes | Data.gov | Public Safety | ~800k | Server |
| LA Parking Citations | Data.gov | Transportation | ~1M | Server |
| World Bank GDP | World Bank | Economics | ~15k | Client |
| World Population | World Bank | Demographics | ~15k | Client |
| Life Expectancy | World Bank | Health | ~15k | Client |
| Internet Users | World Bank | Technology | ~12k | Client |
| COVID-19 Data | Our World in Data | Health | ~200k | Server |
| CO2 Emissions | Our World in Data | Environment | ~50k | Client |
| US Population | US Census | Demographics | ~5k | Client |

## 🚀 Deployment to Render

### Quick Deploy Options

**Option 1: Render CLI (Recommended)**
```bash
# Install Render CLI
curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh

# Or build from source
git clone https://github.com/render-oss/cli.git && cd cli
go build -o render . && sudo mv render /usr/local/bin/

# Authenticate
render login

# Validate configuration
render blueprints validate

# Deploy (via dashboard blueprint feature)
./deploy-cli.sh
```

**Option 2: API Deployment Script**
```bash
# Set your Render API key
export RENDER_API_KEY='rnd_your_api_key_here'

# Run deployment
./deploy.sh
```

**Option 3: Render Dashboard (GUI)**
- Go to https://dashboard.render.com
- Click "New" → "Blueprint"
- Connect GitHub repository: `nite/catalyst`
- Render auto-detects `render.yaml` and deploys both services

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide.

### Prerequisites

- GitHub account with repository
- Render account (free tier available)
- Render CLI (for CLI deployment) OR API key (for script deployment)

### Deployment Steps (Dashboard)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Catalyst deployment"
   git push origin main
   ```

2. **Deploy via Render Dashboard:**
   - Go to https://render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services

3. **Alternative: Manual Deployment**

   **Backend:**
   - New → Web Service
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   
   **Frontend:**
   - New → Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Add Environment Variable: `VITE_API_URL=<your-backend-url>/api/v1`

4. **Verify Deployment:**
   - Backend: Visit `<backend-url>/docs` for API docs
   - Frontend: Visit `<frontend-url>` to see the app

### Environment Variables

**Backend (.env):**
```env
CORS_ORIGINS=["https://your-frontend.onrender.com"]
DATA_GOV_API_TOKEN=optional
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

## 📖 API Documentation

### Endpoints

#### `GET /api/v1/datasets`
List all available datasets with metadata.

**Response:**
```json
[
  {
    "id": "wb-gdp-per-capita",
    "name": "GDP per Capita (World Bank)",
    "description": "GDP per capita for all countries over time",
    "provider": "world_bank",
    "category": "Economics",
    "tags": ["gdp", "economy"],
    "size_estimate": 15000
  }
]
```

#### `GET /api/v1/datasets/{dataset_id}`
Get specific dataset metadata.

#### `GET /api/v1/datasets/{dataset_id}/data`
Fetch dataset with smart aggregation.

**Query Parameters:**
- `aggregation_strategy`: `auto` | `client` | `server` (default: `auto`)
- `max_rows`: Maximum rows to return (optional)
- `limit`: Initial fetch limit (default: 10000)

**Response:**
```json
{
  "dataset_id": "wb-gdp-per-capita",
  "total_rows": 15234,
  "returned_rows": 15234,
  "aggregation_applied": false,
  "suggested_strategy": "client",
  "data_size_bytes": 234567,
  "columns": ["country", "year", "value"],
  "data": [...]
}
```

#### `POST /api/v1/datasets/{dataset_id}/analyze`
Analyze dataset and get visualization config.

**Response:**
```json
{
  "data_type": "time_series",
  "recommended_chart": "line",
  "x_axis": "year",
  "y_axis": "value",
  "group_by": "country",
  "filters": [
    {
      "column": "year",
      "filter_type": "date_range"
    }
  ]
}
```

#### `POST /api/v1/datasets/{dataset_id}/aggregate`
Perform server-side aggregation.

**Request Body:**
```json
{
  "group_by": ["country"],
  "aggregations": {
    "value": "avg"
  },
  "filters": {},
  "limit": 100
}
```

## 🎯 Performance Characteristics

### Client-Side Processing (DuckDB-WASM)

**Advantages:**
- ⚡ Instant filtering (0ms latency)
- 🔄 No server round trips
- 💾 Works offline after initial load
- 🚀 Handles datasets up to 100k+ rows smoothly

**Limitations:**
- 📦 Initial load transfers full dataset
- 💻 Limited by browser memory
- 🔋 More CPU usage on mobile devices

### Server-Side Processing (Pandas)

**Advantages:**
- 📊 Handles millions of rows
- 🔥 Pre-aggregated for efficiency
- 💾 Lower memory usage on client
- 🔋 Less battery drain on mobile

**Limitations:**
- 🌐 Requires network for each filter change
- ⏱️ Latency for each request (~200-500ms)
- 🔌 Requires server availability

### Automatic Strategy Selection

The system automatically chooses the best strategy based on:
- Total row count (threshold: 100,000)
- Estimated data size (threshold: 5MB)
- Available in `settings.py` for easy tuning

## 🔧 Configuration

### Adjusting Thresholds

Edit `backend/app/core/config.py`:

```python
# Data size thresholds for aggregation strategy
large_dataset_row_threshold: int = 100000  # Rows
large_dataset_size_threshold: int = 5 * 1024 * 1024  # 5MB
```

### Adding New Datasets

Edit `backend/app/services/catalog.py`:

```python
DatasetMetadata(
    id="my-dataset",
    name="My Dataset",
    description="Description",
    provider=DataProvider.DATA_GOV,
    category="Category",
    tags=["tag1", "tag2"],
    url="https://api.example.com/data",
    size_estimate=10000,
    update_frequency="daily"
)
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- **Data Providers**: data.gov, World Bank, Our World in Data, NOAA, US Census
- **Libraries**: React, FastAPI, ECharts, DuckDB-WASM, Pandas
- **Hosting**: Render

---

Built with ❤️ for exploring open data on any device, anywhere.