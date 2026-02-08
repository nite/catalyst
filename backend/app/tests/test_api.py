import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_root():
    """Test root endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data


@pytest.mark.asyncio
async def test_health():
    """Test health endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_list_datasets():
    """Test listing all datasets."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/datasets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10  # Should have at least 10 datasets
        
        # Verify dataset structure
        dataset = data[0]
        assert "id" in dataset
        assert "name" in dataset
        assert "provider" in dataset
        assert "category" in dataset


@pytest.mark.asyncio
async def test_get_dataset():
    """Test getting specific dataset."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/datasets/wb-gdp-per-capita")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "wb-gdp-per-capita"
        assert data["name"] == "GDP per Capita (World Bank)"


@pytest.mark.asyncio
async def test_get_dataset_not_found():
    """Test getting non-existent dataset."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/datasets/non-existent")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_dataset_data():
    """Test fetching dataset data."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Use a dataset that should have sample/mock data
        response = await client.get("/api/v1/datasets/census-population-estimates/data?limit=100")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "dataset_id" in data
        assert "total_rows" in data
        assert "returned_rows" in data
        assert "aggregation_applied" in data
        assert "suggested_strategy" in data
        assert "data_size_bytes" in data
        assert "columns" in data
        assert "data" in data
        
        # Verify data
        assert isinstance(data["data"], list)
        assert len(data["data"]) > 0


@pytest.mark.asyncio
async def test_analyze_dataset():
    """Test dataset analysis."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/datasets/census-population-estimates/analyze?limit=100")
        assert response.status_code == 200
        data = response.json()
        
        # Verify analysis structure
        assert "data_type" in data
        assert "recommended_chart" in data
        assert "filters" in data
        assert isinstance(data["filters"], list)


@pytest.mark.asyncio
async def test_aggregate_dataset():
    """Test server-side aggregation."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        aggregation_spec = {
            "group_by": ["state"],
            "aggregations": {
                "population": "sum"
            },
            "limit": 10
        }
        
        response = await client.post(
            "/api/v1/datasets/census-population-estimates/aggregate",
            json=aggregation_spec
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify aggregated response
        assert data["aggregation_applied"] is True
        assert len(data["data"]) <= 10
        assert "metadata" in data
