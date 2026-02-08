"""
Performance and integration tests for Catalyst.
"""

import pytest
from httpx import AsyncClient
from app.main import app
from app.core.models import AggregationStrategy


@pytest.mark.asyncio
async def test_small_dataset_uses_client_strategy():
    """Test that small datasets use client-side strategy."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/datasets/census-population-estimates/data")
        assert response.status_code == 200
        data = response.json()
        
        # Small dataset should use client strategy
        assert data["suggested_strategy"] == AggregationStrategy.CLIENT
        assert data["total_rows"] < 100000
        assert data["data_size_bytes"] < 5 * 1024 * 1024


@pytest.mark.asyncio
async def test_aggregation_reduces_data_size():
    """Test that server-side aggregation reduces data."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Request aggregation
        aggregation_spec = {
            "group_by": ["state"],
            "aggregations": {
                "population": "sum"
            },
            "limit": 5
        }
        
        response = await client.post(
            "/api/v1/datasets/census-population-estimates/aggregate",
            json=aggregation_spec
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be aggregated
        assert data["aggregation_applied"] is True
        assert data["returned_rows"] <= 5
        
        # Should have metadata about reduction
        assert "metadata" in data
        assert "reduction_ratio" in data["metadata"]


@pytest.mark.asyncio  
@pytest.mark.skip(reason="Requires external API access - run manually to verify")
async def test_end_to_end_flow():
    """Test complete flow: browse → get dataset → analyze → visualize."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. Browse datasets
        response = await client.get("/api/v1/datasets")
        assert response.status_code == 200
        datasets = response.json()
        assert len(datasets) >= 10
        
        # 2. Get specific dataset
        dataset_id = datasets[0]["id"]
        response = await client.get(f"/api/v1/datasets/{dataset_id}")
        assert response.status_code == 200
        
        # 3. Analyze dataset
        response = await client.post(f"/api/v1/datasets/{dataset_id}/analyze")
        assert response.status_code == 200
        analysis = response.json()
        assert "recommended_chart" in analysis
        assert "filters" in analysis
        
        # 4. Get data for visualization
        response = await client.get(f"/api/v1/datasets/{dataset_id}/data?limit=100")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) > 0
        assert "suggested_strategy" in data


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires external World Bank API access - run manually to verify")
async def test_world_bank_data_fetching():
    """Test fetching real data from World Bank API."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # This tests actual API integration
        response = await client.get("/api/v1/datasets/wb-gdp-per-capita/data?limit=100")
        assert response.status_code == 200
        data = response.json()
        
        # Should have fetched actual data
        assert data["total_rows"] > 0
        assert len(data["data"]) > 0
        
        # Data should have expected structure
        if data["data"]:
            first_row = data["data"][0]
            assert "country" in first_row or "value" in first_row


@pytest.mark.asyncio  
async def test_visualization_config_generation():
    """Test that visualization configs are properly generated."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test with census data (should detect geographic)
        response = await client.post("/api/v1/datasets/census-population-estimates/analyze")
        assert response.status_code == 200
        config = response.json()
        
        # Should have detected data type
        assert config["data_type"] in ["geographic", "categorical", "numerical"]
        
        # Should have suggested a chart
        assert config["recommended_chart"] in ["line", "bar", "pie", "scatter", "map", "heatmap"]
        
        # Should have filters
        assert isinstance(config["filters"], list)
        assert len(config["filters"]) > 0
