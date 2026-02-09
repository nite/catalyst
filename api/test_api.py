"""
API Tests
Tests all API endpoints and data fetching logic
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add api to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.datasets import get_all_datasets, get_dataset_by_id, fetch_dataset_data

client = TestClient(app)


class TestAPI:
    """Test API endpoints"""

    def test_root_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_list_datasets(self):
        """Test listing all datasets"""
        response = client.get("/datasets")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "datasets" in data
        assert data["total"] > 0
        assert len(data["datasets"]) > 0

    def test_list_datasets_with_filters(self):
        """Test dataset listing with filters"""
        # Filter by provider
        response = client.get("/datasets?provider=worldbank")
        assert response.status_code == 200
        data = response.json()
        assert all(ds["provider"] == "worldbank" for ds in data["datasets"])

        # Filter by category
        response = client.get("/datasets?category=health")
        assert response.status_code == 200
        data = response.json()
        assert all(ds["category"] == "health" for ds in data["datasets"])

    def test_get_dataset_details(self):
        """Test getting specific dataset details"""
        # Get a known dataset
        response = client.get("/datasets/world-gdp")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "world-gdp"
        assert "name" in data
        assert "provider" in data
        assert "columns" in data

    def test_get_nonexistent_dataset(self):
        """Test getting a dataset that doesn't exist"""
        response = client.get("/datasets/nonexistent")
        assert response.status_code == 404

    def test_fetch_dataset_data(self):
        """Test fetching dataset data"""
        response = client.get("/datasets/world-gdp/data?limit=50")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert "metadata" in data
        assert len(data["data"]) > 0

    def test_fetch_dataset_data_with_pagination(self):
        """Test pagination parameters"""
        response = client.get("/datasets/global-temperature/data?limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 10

    def test_analyze_dataset(self):
        """Test dataset analysis endpoint"""
        response = client.post("/datasets/world-gdp/analyze")
        assert response.status_code == 200
        data = response.json()
        assert "statistics" in data
        assert "columns" in data
        assert "chart_suggestions" in data
        assert "filters" in data
        assert len(data["chart_suggestions"]) > 0

    def test_analyze_nonexistent_dataset(self):
        """Test analysis of nonexistent dataset"""
        response = client.post("/datasets/nonexistent/analyze")
        assert response.status_code == 404

    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestDatasets:
    """Test dataset fetching logic"""

    def test_get_all_datasets(self):
        """Test getting all datasets"""
        datasets = get_all_datasets()
        assert len(datasets) >= 10  # Should have at least 10 datasets
        assert all("id" in ds for ds in datasets)
        assert all("name" in ds for ds in datasets)
        assert all("provider" in ds for ds in datasets)

    def test_get_dataset_by_id(self):
        """Test getting dataset by ID"""
        dataset = get_dataset_by_id("world-gdp")
        assert dataset is not None
        assert dataset["id"] == "world-gdp"
        assert dataset["provider"] == "worldbank"

        # Test nonexistent dataset
        dataset = get_dataset_by_id("nonexistent")
        assert dataset is None

    def test_fetch_mock_data(self):
        """Test fetching mock data"""
        # Test various mock datasets
        for dataset_id in [
            "global-temperature",
            "us-census-population",
            "renewable-energy-capacity",
            "education-spending",
        ]:
            result = fetch_dataset_data(dataset_id, limit=50)
            assert result["dataset_id"] == dataset_id
            assert len(result["data"]) > 0
            assert len(result["data"]) <= 50

    def test_worldbank_data_structure(self):
        """Test World Bank data fetching (may fail if API is down)"""
        try:
            result = fetch_dataset_data("world-gdp", limit=20)
            assert result["dataset_id"] == "world-gdp"
            assert len(result["data"]) > 0
            # Check data structure
            if result["data"]:
                row = result["data"][0]
                assert "country" in row or "year" in row or "value" in row
        except Exception as e:
            pytest.skip(f"World Bank API unavailable: {str(e)}")


class TestAnalyzer:
    """Test visualization analyzer"""

    def test_analysis_with_mock_data(self):
        """Test analysis with various mock datasets"""
        from app.analyzer import analyze_dataset

        # Test time series dataset
        data = fetch_dataset_data("global-temperature", limit=100)
        dataset = get_dataset_by_id("global-temperature")
        analysis = analyze_dataset(data, dataset)

        assert "statistics" in analysis
        assert "columns" in analysis
        assert "chart_suggestions" in analysis
        assert analysis["statistics"]["total_rows"] > 0

        # Should suggest line chart for time series
        chart_types = [s["chart_type"] for s in analysis["chart_suggestions"]]
        assert "line" in chart_types or "scatter" in chart_types

    def test_analysis_generates_filters(self):
        """Test that analysis generates appropriate filters"""
        from app.analyzer import analyze_dataset

        data = fetch_dataset_data("us-census-population", limit=100)
        dataset = get_dataset_by_id("us-census-population")
        analysis = analyze_dataset(data, dataset)

        assert "filters" in analysis
        assert len(analysis["filters"]) > 0

        # Check filter types
        filter_types = [f["filter_type"] for f in analysis["filters"]]
        assert any(ft in ["date_range", "range", "multi_select"] for ft in filter_types)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
