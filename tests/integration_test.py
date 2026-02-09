#!/usr/bin/env python3
"""
Integration tests for Catalyst platform
Tests end-to-end functionality including API calls to real data providers
"""

import requests
import time
import json

# Base URL for API
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check endpoint...")
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")

def test_list_datasets():
    """Test listing datasets"""
    print("\nTesting dataset listing...")
    response = requests.get(f"{BASE_URL}/datasets")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 10
    assert len(data["datasets"]) >= 10
    print(f"✅ Found {data['total']} datasets")

def test_get_dataset_details():
    """Test getting dataset details"""
    print("\nTesting dataset details...")
    test_datasets = ["world-gdp", "global-temperature", "us-census-population"]
    
    for dataset_id in test_datasets:
        response = requests.get(f"{BASE_URL}/datasets/{dataset_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == dataset_id
        assert "name" in data
        assert "provider" in data
        print(f"✅ Dataset {dataset_id}: {data['name']}")

def test_fetch_dataset_data():
    """Test fetching dataset data"""
    print("\nTesting data fetching...")
    test_datasets = ["world-gdp", "global-temperature", "renewable-energy-capacity"]
    
    for dataset_id in test_datasets:
        response = requests.get(f"{BASE_URL}/datasets/{dataset_id}/data?limit=20")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) > 0
        assert data["total"] > 0
        print(f"✅ Fetched {data['total']} rows from {dataset_id}")

def test_analyze_dataset():
    """Test dataset analysis endpoint"""
    print("\nTesting dataset analysis...")
    test_datasets = ["world-gdp", "air-quality-index", "literacy-rates"]
    
    for dataset_id in test_datasets:
        response = requests.post(f"{BASE_URL}/datasets/{dataset_id}/analyze")
        assert response.status_code == 200
        data = response.json()
        assert "statistics" in data
        assert "columns" in data
        assert "chart_suggestions" in data
        assert len(data["chart_suggestions"]) > 0
        
        print(f"✅ Analysis for {dataset_id}:")
        print(f"   - Rows: {data['statistics']['total_rows']}")
        print(f"   - Columns: {data['statistics']['total_columns']}")
        print(f"   - Chart suggestions: {len(data['chart_suggestions'])}")
        print(f"   - Recommended: {data['chart_suggestions'][0]['chart_type']}")

def test_filters():
    """Test filtering functionality"""
    print("\nTesting data filtering...")
    
    # Test with filters
    response = requests.get(
        f"{BASE_URL}/datasets/global-temperature/data",
        params={"limit": 100}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    print(f"✅ Filter test passed - got {len(data['data'])} rows")

def test_provider_filter():
    """Test filtering by provider"""
    print("\nTesting provider filtering...")
    
    providers = ["worldbank", "data.gov", "owid"]
    for provider in providers:
        response = requests.get(f"{BASE_URL}/datasets?provider={provider}")
        assert response.status_code == 200
        data = response.json()
        if data["total"] > 0:
            assert all(ds["provider"] == provider for ds in data["datasets"])
            print(f"✅ Provider filter '{provider}': {data['total']} datasets")

def test_category_filter():
    """Test filtering by category"""
    print("\nTesting category filtering...")
    
    categories = ["health", "economy", "climate"]
    for category in categories:
        response = requests.get(f"{BASE_URL}/datasets?category={category}")
        assert response.status_code == 200
        data = response.json()
        if data["total"] > 0:
            assert all(ds["category"] == category for ds in data["datasets"])
            print(f"✅ Category filter '{category}': {data['total']} datasets")

def test_worldbank_integration():
    """Test World Bank data integration (with fallback to mock)"""
    print("\nTesting World Bank integration...")
    
    worldbank_datasets = ["world-gdp", "world-population", "world-life-expectancy"]
    
    for dataset_id in worldbank_datasets:
        response = requests.get(f"{BASE_URL}/datasets/{dataset_id}/data?limit=50")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) > 0
        assert "country" in data["data"][0]
        assert "year" in data["data"][0]
        assert "value" in data["data"][0]
        print(f"✅ World Bank dataset {dataset_id}: {len(data['data'])} rows")

def run_all_tests():
    """Run all integration tests"""
    print("=" * 60)
    print("Catalyst Platform - Integration Tests")
    print("=" * 60)
    
    try:
        test_health_check()
        test_list_datasets()
        test_get_dataset_details()
        test_fetch_dataset_data()
        test_analyze_dataset()
        test_filters()
        test_provider_filter()
        test_category_filter()
        test_worldbank_integration()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        return True
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API server at", BASE_URL)
        print("Make sure the api server is running:")
        print("  cd api && uvicorn app.main:app --host 0.0.0.0 --port 8000")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
