"""
Catalyst - Mobile-First Data Visualization Platform
FastAPI Backend Server
"""

from fastapi import FastAPI, HTTPException, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
import logging
from pathlib import Path

from .datasets import get_all_datasets, get_dataset_by_id, fetch_dataset_data
from .analyzer import analyze_dataset

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Catalyst API",
    description="Mobile-first data visualization platform API",
    version="1.0.0"
)

api_router = APIRouter(prefix="/api")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api_router.get("/")
async def root():
    """API status endpoint"""
    return {
        "message": "Catalyst API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@api_router.get("/datasets")
async def list_datasets(
    provider: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=100)
):
    """
    List all available datasets with metadata
    
    Query Parameters:
    - provider: Filter by data provider (data.gov, worldbank, owid, noaa, census)
    - category: Filter by category (economy, health, climate, demographics, etc.)
    - limit: Maximum number of results (1-100)
    """
    try:
        datasets = get_all_datasets()
        
        # Apply filters
        if provider:
            datasets = [d for d in datasets if d.get("provider") == provider]
        if category:
            datasets = [d for d in datasets if d.get("category") == category]
        
        # Limit results
        datasets = datasets[:limit]
        
        return {
            "total": len(datasets),
            "datasets": datasets
        }
    except Exception as e:
        logger.error(f"Error listing datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """
    Get specific dataset details including metadata and column information
    """
    try:
        dataset = get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
        return dataset
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dataset {dataset_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/datasets/{dataset_id}/data")
async def get_dataset_data(
    dataset_id: str,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    filters: Optional[str] = None
):
    """
    Fetch dataset data with filtering and pagination
    
    Query Parameters:
    - limit: Maximum rows to return (1-1000)
    - offset: Number of rows to skip
    - date_from: Start date for time series filtering (ISO format)
    - date_to: End date for time series filtering (ISO format)
    - filters: JSON string of additional filters
    """
    try:
        data = fetch_dataset_data(
            dataset_id=dataset_id,
            limit=limit,
            offset=offset,
            date_from=date_from,
            date_to=date_to,
            filters=filters
        )
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching data for {dataset_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/datasets/{dataset_id}/analyze")
async def analyze_dataset_endpoint(
    dataset_id: str,
    sample_size: int = Query(default=1000, ge=100, le=10000)
):
    """
    Analyze dataset and return visualization recommendations
    
    Returns:
    - Suggested chart types
    - Filter configurations
    - Data type analysis
    - Column statistics
    """
    try:
        dataset = get_dataset_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
        
        # Fetch sample data for analysis
        data = fetch_dataset_data(dataset_id=dataset_id, limit=sample_size)
        
        # Analyze and return recommendations
        analysis = analyze_dataset(data, dataset)
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing dataset {dataset_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "catalyst-api"}


@app.get("/health")
async def root_health_check():
    """Health check endpoint for platform monitoring"""
    return {"status": "healthy", "service": "catalyst"}


app.include_router(api_router)

static_dir = Path(__file__).resolve().parents[2] / "frontend" / "dist"
index_file = static_dir / "index.html"
assets_dir = static_dir / "assets"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/", include_in_schema=False)
async def serve_root():
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not built"}


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    target = static_dir / full_path
    if target.exists() and target.is_file():
        return FileResponse(target)
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not built"}
