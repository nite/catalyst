# Catalyst 📊

**Mobile-first data visualization platform** for exploring and visualizing open datasets anywhere, anytime.

![Catalyst](https://img.shields.io/badge/Status-Production_Ready-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
[![Deploy to Koyeb](https://img.shields.io/badge/Deploy_to-Koyeb-121212?logo=koyeb)](https://app.koyeb.com/deploy?type=docker&repository=github.com/nite/catalyst&branch=main&name=catalyst)

## 🌟 Overview

Catalyst is a complete mobile-first data visualization platform that allows users to browse popular open datasets and visualize them with automatically configured charts and filters. No data science expertise required - just select a dataset and start exploring!

### Key Features

- **15+ Curated Datasets** from trusted sources (data.gov, World Bank, Our World in Data, NOAA, US Census)
- **Smart Visualization Engine** that automatically detects data types and suggests appropriate chart types
- **Interactive Filters** with active filter chips for quick management and removal
- **KPI Summary Strip** showing dataset statistics at a glance (row count, time range, metrics)
- **Dataset Coverage Panel** with detailed information about time range, geography, and data quality
- **Mobile-First Design** with responsive layouts and touch-friendly interactions
- **Real-Time Data Fetching** from multiple open data providers
- **Chart.js Integration** for beautiful, interactive visualizations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dataset    │  │    Chart     │  │   Filters    │  │
│  │   Browser    │  │   Renderer   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                   API (FastAPI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dataset    │  │ Visualization│  │     Data     │  │
│  │   Catalog    │  │   Analyzer   │  │   Fetcher    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              External Data Sources                       │
│  data.gov • World Bank • OWID • NOAA • US Census        │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** for api
- **Node.js 18+** for web
- **npm or yarn** for package management

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/nite/catalyst.git
cd catalyst
```

#### 2. API Setup

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the api server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

#### 3. Web Setup

```bash
cd web

# Install dependencies
npm install

# Run development server
npm run dev
```

The web will be available at `http://localhost:3000`

## 📡 API Endpoints

### Core Endpoints

- **`GET /`** - Health check
- **`GET /datasets`** - List all available datasets
  - Query params: `provider`, `category`, `limit`
- **`GET /datasets/{dataset_id}`** - Get specific dataset details
- **`GET /datasets/{dataset_id}/data`** - Fetch dataset data
  - Query params: `limit`, `offset`, `date_from`, `date_to`, `filters`
- **`POST /datasets/{dataset_id}/analyze`** - Analyze dataset and get visualization recommendations

### Example API Usage

```bash
# List all datasets
curl http://localhost:8000/datasets

# Get specific dataset
curl http://localhost:8000/datasets/world-gdp

# Fetch data with filters
curl "http://localhost:8000/datasets/world-gdp/data?limit=100"

# Analyze dataset
curl -X POST http://localhost:8000/datasets/world-gdp/analyze
```

## 📊 Integrated Datasets

### Health
- COVID-19 Cases in the United States
- COVID-19 Vaccinations (Our World in Data)
- Life Expectancy at Birth
- Air Quality Index by City

### Economy
- World GDP Per Capita
- US Unemployment Rates by State
- Government Education Spending

### Climate
- Global Temperature Anomalies
- CO2 Emissions
- Global Energy Use
- Renewable Energy Capacity

### Demographics
- World Population
- US Census Population Estimates
- Adult Literacy Rates

### Technology & Education
- Internet Users Worldwide
- Education Spending

## 🎨 Smart Visualization Engine

The api automatically analyzes datasets and recommends appropriate chart types:

| Data Pattern | Recommended Chart | Use Case |
|-------------|-------------------|----------|
| Time Series Data | Line Chart | Trends over time |
| Categorical Comparison | Bar Chart | Compare categories |
| Proportions | Pie/Donut Chart | Part-to-whole relationships |
| Correlation | Scatter Plot | Relationship between variables |
| Geographic Data | Map/Choropleth | Spatial distributions |

### How It Works

1. **Data Type Detection**: Identifies numerical, categorical, temporal, and geographic columns
2. **Pattern Recognition**: Analyzes data structure and relationships
3. **Chart Suggestion**: Recommends optimal visualization types
4. **Filter Generation**: Creates appropriate filters based on data types

## 🧪 Testing

### API Tests

```bash
cd api
pytest test_api.py -v
```

Tests cover:
- ✅ All API endpoints
- ✅ Data fetching from multiple providers
- ✅ Visualization analysis logic
- ✅ Filter functionality
- ✅ Mock data generation

### Web Tests

```bash
cd web
npm test
```

### Manual Testing

1. **Browse Datasets**: Navigate to `/datasets` and verify all datasets are listed
2. **Filter Datasets**: Test provider and category filters
3. **View Dataset**: Click on a dataset to view visualizations
4. **Apply Filters**: Test date range, category, and numeric filters
5. **Chart Types**: Switch between different chart types
6. **Mobile Responsive**: Test on different screen sizes

## 🚢 Deployment

Catalyst supports deployment to multiple platforms:

### Deploy to Koyeb (Recommended)

**One-Click Deploy:**

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=docker&repository=github.com/nite/catalyst&branch=main&name=catalyst)

**Manual Deployment:**

```bash
# Using the deployment script
./deploy-koyeb.sh

# Or deploy via Koyeb CLI
koyeb service create catalyst-app \
  --app catalyst \
  --git github.com/nite/catalyst \
  --git-branch main \
  --git-builder docker \
  --ports 8000:http \
  --routes /:8000 \
  --instance-type nano \
  --env PORT=8000 \
  --health-checks http:8000:/health
```

See [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md) for complete deployment guide.

**Benefits:**
- ✅ Global edge network
- ✅ Auto-scaling
- ✅ Free tier available
- ✅ Docker-based deployment
- ✅ Zero-downtime deployments
- ✅ Built-in SSL certificates

### Deploy to Render

The project includes a `render.yaml` configuration for easy deployment to Render.

**Deployment Steps:**

1. **Connect GitHub Repository** to Render
2. **Create Blueprint** from `render.yaml`
3. **Deploy** - Render will automatically:
   - Deploy the FastAPI api as a Web Service
   - Deploy the React web as a Static Site
   - Set up environment variables
   - Configure CORS for web-api communication

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Render deployment guide.

### Environment Variables

**For Koyeb and Render:**
- `PORT` - Service port (default: 8000)
- `PYTHON_VERSION` - Python version for api (default: 3.12)

**Render only:**
- `VITE_API_URL` - API URL (auto-linked from service)

### Dataset API Keys

You can enable additional datasets by providing API keys. Copy the template in [.env.example](.env.example) and set any of the following:

- `CENSUS_API_KEY` - US Census (ACS 1-year) population dataset
- `OPENWEATHER_API_KEY` - OpenWeather 5-day forecast dataset
- `WEATHERAPI_API_KEY` - WeatherAPI 7-day forecast dataset
- `NASA_EARTHDATA_TOKEN` - NASA Earthdata MODIS granules dataset
- `FRED_API_KEY` - FRED GDP series dataset
- `ALPHAVANTAGE_API_KEY` - Alpha Vantage daily stock dataset
- `OPENAQ_API_KEY` - OpenAQ air quality dataset
- `SOCRATA_APP_TOKEN` - NYC Open Data (Socrata) 311 dataset
- `GDELT_API_KEY` - GDELT events dataset
- `WORLD_BANK_API_KEY` - Optional World Bank API key (used if provided)

Registration and docs pages:

- `CENSUS_API_KEY` - [Get key](https://api.census.gov/data/key_signup.html) | [Docs](https://api.census.gov/data.html)
- `OPENWEATHER_API_KEY` - [Get key](https://home.openweathermap.org/users/sign_up) | [Docs](https://openweathermap.org/api)
- `WEATHERAPI_API_KEY` - [Get key](https://www.weatherapi.com/signup.aspx) | [Docs](https://www.weatherapi.com/docs/)
- `NASA_EARTHDATA_TOKEN` - [Create Earthdata login](https://urs.earthdata.nasa.gov/users/new) | [Docs](https://earthdata.nasa.gov/learn/earthdata-login)
- `FRED_API_KEY` - [Get key](https://fred.stlouisfed.org/docs/api/api_key.html) | [Docs](https://fred.stlouisfed.org/docs/api/fred/)
- `ALPHAVANTAGE_API_KEY` - [Get key](https://www.alphavantage.co/support/#api-key) | [Docs](https://www.alphavantage.co/documentation/)
- `OPENAQ_API_KEY` - [Get key](https://openaq.org/#/register) | [Docs](https://docs.openaq.org/)
- `SOCRATA_APP_TOKEN` - [Create app token](https://data.cityofnewyork.us/profile/edit/developer_settings) | [Docs](https://dev.socrata.com/)
- `GDELT_API_KEY` - [Docs](https://www.gdeltproject.org/) (key optional)
- `WORLD_BANK_API_KEY` - [Docs](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-api-basic-call-structures) (key optional)

## 🛠️ Technology Stack

### Web
- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Data visualization library
- **React Chart.js 2** - React wrapper for Chart.js
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Icons** - Icon library

### API
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data manipulation and analysis
- **Requests** - HTTP library for data fetching
- **Pydantic** - Data validation

### Deployment
- **Render** - Cloud platform for hosting
- **Koyeb** - Serverless platform for global deployment

## 📱 Mobile-First Features

- **Responsive Grid Layouts** that adapt to screen sizes
- **Touch-Friendly Controls** with appropriate tap targets
- **Collapsible Filters** for mobile screens
- **Optimized Charts** with reduced data points on mobile
- **Swipe Gestures** support (via native browser)
- **Mobile Navigation** with hamburger menu

## 🔒 Security & Best Practices

- ✅ CORS configured for secure web-api communication
- ✅ Input validation with Pydantic models
- ✅ Error handling and logging
- ✅ Rate limiting ready (can be added via middleware)
- ✅ Environment-based configuration
- ✅ No hardcoded credentials

## 📈 Future Enhancements

- [ ] User authentication and saved dashboards
- [ ] Custom dataset uploads
- [ ] More data providers (NASA, OpenAQ, etc.)
- [ ] Advanced analytics (correlation matrix, statistics)
- [ ] Export charts as images
- [ ] Real-time data updates with WebSockets
- [ ] Dark mode support
- [ ] Multilingual support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Data providers: data.gov, World Bank, Our World in Data, NOAA, US Census Bureau
- Chart.js for excellent visualization library
- FastAPI for the amazing Python framework
- TailwindCSS for beautiful, responsive design

---

**Built with ❤️ for data enthusiasts everywhere**