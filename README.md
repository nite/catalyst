# Catalyst 📊

**Mobile-first data visualization platform** for exploring and visualizing open datasets anywhere, anytime.

![Catalyst](https://img.shields.io/badge/Status-Production_Ready-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)

## 🌟 Overview

Catalyst is a complete mobile-first data visualization platform that allows users to browse popular open datasets and visualize them with automatically configured charts and filters. No data science expertise required - just select a dataset and start exploring!

### Key Features

- **15+ Curated Datasets** from trusted sources (data.gov, World Bank, Our World in Data, NOAA, US Census)
- **Smart Visualization Engine** that automatically detects data types and suggests appropriate chart types
- **Interactive Filters** including date ranges, category selectors, and numeric range sliders
- **Mobile-First Design** with responsive layouts and touch-friendly interactions
- **Real-Time Data Fetching** from multiple open data providers
- **Chart.js Integration** for beautiful, interactive visualizations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dataset    │  │    Chart     │  │   Filters    │  │
│  │   Browser    │  │   Renderer   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
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

- **Python 3.11+** for backend
- **Node.js 18+** for frontend
- **npm or yarn** for package management

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/nite/catalyst.git
cd catalyst
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

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

The backend automatically analyzes datasets and recommends appropriate chart types:

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

### Backend Tests

```bash
cd backend
pytest test_api.py -v
```

Tests cover:
- ✅ All API endpoints
- ✅ Data fetching from multiple providers
- ✅ Visualization analysis logic
- ✅ Filter functionality
- ✅ Mock data generation

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. **Browse Datasets**: Navigate to `/datasets` and verify all datasets are listed
2. **Filter Datasets**: Test provider and category filters
3. **View Dataset**: Click on a dataset to view visualizations
4. **Apply Filters**: Test date range, category, and numeric filters
5. **Chart Types**: Switch between different chart types
6. **Mobile Responsive**: Test on different screen sizes

## 🚢 Deployment to Render

The project includes a `render.yaml` configuration for easy deployment to Render.

### Deployment Steps

1. **Connect GitHub Repository** to Render
2. **Create Blueprint** from `render.yaml`
3. **Deploy** - Render will automatically:
   - Deploy the FastAPI backend as a Web Service
   - Deploy the React frontend as a Static Site
   - Set up environment variables
   - Configure CORS for frontend-backend communication

### Environment Variables

The `render.yaml` automatically configures:
- `VITE_API_URL` - Backend API URL (auto-linked)
- `PORT` - Service port
- `PYTHON_VERSION` - Python version for backend

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Data visualization library
- **React Chart.js 2** - React wrapper for Chart.js
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data manipulation and analysis
- **Requests** - HTTP library for data fetching
- **Pydantic** - Data validation

### Deployment
- **Render** - Cloud platform for hosting

## 📱 Mobile-First Features

- **Responsive Grid Layouts** that adapt to screen sizes
- **Touch-Friendly Controls** with appropriate tap targets
- **Collapsible Filters** for mobile screens
- **Optimized Charts** with reduced data points on mobile
- **Swipe Gestures** support (via native browser)
- **Mobile Navigation** with hamburger menu

## 🔒 Security & Best Practices

- ✅ CORS configured for secure frontend-backend communication
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