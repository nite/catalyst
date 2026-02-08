"""
API endpoints for dataset operations.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.models import (
    DatasetMetadata, DataResponse, VisualizationConfig, 
    AggregationSpec, AggregationStrategy
)
from app.services.catalog import get_all_datasets, get_dataset_by_id
from app.services.data_fetcher import DataFetcher
from app.services.analyzer import DataAnalyzer
from app.services.aggregator import DataAggregator

router = APIRouter(prefix="/datasets", tags=["datasets"])

data_fetcher = DataFetcher()
analyzer = DataAnalyzer()
aggregator = DataAggregator()


@router.get("", response_model=list[DatasetMetadata])
async def list_datasets():
    """Get all available datasets with metadata."""
    return get_all_datasets()


@router.get("/{dataset_id}", response_model=DatasetMetadata)
async def get_dataset(dataset_id: str):
    """Get specific dataset details."""
    dataset = get_dataset_by_id(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.get("/{dataset_id}/data", response_model=DataResponse)
async def get_dataset_data(
    dataset_id: str,
    aggregation_strategy: Optional[AggregationStrategy] = Query(AggregationStrategy.AUTO),
    max_rows: Optional[int] = Query(None, ge=1, le=1000000),
    limit: Optional[int] = Query(10000, ge=1, le=50000)
):
    """
    Fetch dataset with smart aggregation.
    
    Args:
        dataset_id: Dataset identifier
        aggregation_strategy: Strategy for aggregation (auto, client, server)
        max_rows: Maximum rows to return
        limit: Limit for initial fetch
        
    Returns:
        Dataset with metadata about aggregation strategy
    """
    dataset = get_dataset_by_id(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Fetch data from provider
    try:
        data = await data_fetcher.fetch_data(
            dataset.provider, 
            dataset.url,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch data: {str(e)}"
        )
    
    if not data:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Determine data characteristics
    row_count = len(data)
    data_size = data_fetcher.estimate_data_size(data)
    
    # Determine aggregation strategy
    if aggregation_strategy == AggregationStrategy.AUTO:
        suggested_strategy = analyzer.determine_aggregation_strategy(row_count, data_size)
    else:
        suggested_strategy = aggregation_strategy
    
    # Apply aggregation if needed
    aggregation_applied = False
    if suggested_strategy == AggregationStrategy.SERVER and max_rows and row_count > max_rows:
        # Sample data to reduce size
        data = aggregator.smart_sample(data, target_size=max_rows)
        aggregation_applied = True
    
    # Get columns
    columns = list(data[0].keys()) if data else []
    
    return DataResponse(
        dataset_id=dataset_id,
        total_rows=row_count,
        returned_rows=len(data),
        aggregation_applied=aggregation_applied,
        suggested_strategy=suggested_strategy,
        data_size_bytes=data_size,
        columns=columns,
        data=data
    )


@router.post("/{dataset_id}/analyze", response_model=VisualizationConfig)
async def analyze_dataset(
    dataset_id: str,
    limit: Optional[int] = Query(1000, ge=1, le=10000)
):
    """
    Analyze dataset and return visualization configuration.
    
    Args:
        dataset_id: Dataset identifier
        limit: Sample size for analysis
        
    Returns:
        Visualization configuration with recommended chart type and filters
    """
    dataset = get_dataset_by_id(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Fetch sample data for analysis
    try:
        data = await data_fetcher.fetch_data(
            dataset.provider,
            dataset.url,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch data: {str(e)}"
        )
    
    if not data:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Analyze and return configuration
    config = analyzer.analyze_dataset(data)
    
    return config


@router.post("/{dataset_id}/aggregate", response_model=DataResponse)
async def aggregate_dataset(
    dataset_id: str,
    spec: AggregationSpec
):
    """
    Perform server-side aggregation on dataset.
    
    Args:
        dataset_id: Dataset identifier
        spec: Aggregation specification
        
    Returns:
        Aggregated data
    """
    dataset = get_dataset_by_id(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Fetch data
    try:
        data = await data_fetcher.fetch_data(
            dataset.provider,
            dataset.url,
            limit=50000  # Reasonable limit for aggregation
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch data: {str(e)}"
        )
    
    if not data:
        raise HTTPException(status_code=404, detail="No data available")
    
    # Apply aggregation
    aggregated_data = aggregator.aggregate(data, spec)
    
    # Calculate sizes
    original_size = data_fetcher.estimate_data_size(data)
    aggregated_size = data_fetcher.estimate_data_size(aggregated_data)
    
    columns = list(aggregated_data[0].keys()) if aggregated_data else []
    
    return DataResponse(
        dataset_id=dataset_id,
        total_rows=len(data),
        returned_rows=len(aggregated_data),
        aggregation_applied=True,
        suggested_strategy=AggregationStrategy.SERVER,
        data_size_bytes=aggregated_size,
        columns=columns,
        data=aggregated_data,
        metadata={
            "original_size_bytes": original_size,
            "reduction_ratio": round(aggregated_size / original_size, 2) if original_size > 0 else 1
        }
    )
