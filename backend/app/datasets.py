"""
Dataset catalog and data fetching logic for various open data providers
"""

import requests
import pandas as pd
import json
from typing import Optional, Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Curated dataset catalog from multiple providers
DATASETS = [
    # Data.gov / Socrata datasets
    {
        "id": "covid-cases-us",
        "name": "COVID-19 Cases in the United States",
        "description": "Daily COVID-19 case counts by state",
        "provider": "data.gov",
        "category": "health",
        "url": "https://data.cdc.gov/resource/9mfq-cb36.json",
        "format": "socrata",
        "columns": ["submission_date", "state", "tot_cases", "new_case", "tot_death", "new_death"],
        "date_column": "submission_date",
        "geo_column": "state"
    },
    {
        "id": "us-unemployment",
        "name": "US Unemployment Rates by State",
        "description": "Monthly unemployment rates across US states",
        "provider": "data.gov",
        "category": "economy",
        "url": "https://data.bls.gov/api/unemployment",  # Placeholder
        "format": "custom",
        "columns": ["date", "state", "unemployment_rate"],
        "date_column": "date",
        "geo_column": "state"
    },
    
    # World Bank datasets
    {
        "id": "world-gdp",
        "name": "World GDP Per Capita",
        "description": "GDP per capita for countries worldwide",
        "provider": "worldbank",
        "category": "economy",
        "indicator": "NY.GDP.PCAP.CD",
        "url": "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD",
        "format": "worldbank",
        "columns": ["country", "year", "value"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "world-population",
        "name": "World Population",
        "description": "Total population by country",
        "provider": "worldbank",
        "category": "demographics",
        "indicator": "SP.POP.TOTL",
        "url": "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL",
        "format": "worldbank",
        "columns": ["country", "year", "value"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "world-life-expectancy",
        "name": "Life Expectancy at Birth",
        "description": "Average life expectancy by country",
        "provider": "worldbank",
        "category": "health",
        "indicator": "SP.DYN.LE00.IN",
        "url": "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN",
        "format": "worldbank",
        "columns": ["country", "year", "value"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "world-co2-emissions",
        "name": "CO2 Emissions",
        "description": "CO2 emissions (metric tons per capita)",
        "provider": "worldbank",
        "category": "climate",
        "indicator": "EN.ATM.CO2E.PC",
        "url": "https://api.worldbank.org/v2/country/all/indicator/EN.ATM.CO2E.PC",
        "format": "worldbank",
        "columns": ["country", "year", "value"],
        "date_column": "year",
        "geo_column": "country"
    },
    
    # Our World in Data datasets
    {
        "id": "owid-covid-vaccinations",
        "name": "COVID-19 Vaccinations",
        "description": "COVID-19 vaccination data by country",
        "provider": "owid",
        "category": "health",
        "url": "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json",
        "format": "owid",
        "columns": ["location", "date", "total_vaccinations", "people_vaccinated", "people_fully_vaccinated"],
        "date_column": "date",
        "geo_column": "location"
    },
    {
        "id": "owid-energy-use",
        "name": "Global Energy Use",
        "description": "Energy consumption by source and country",
        "provider": "owid",
        "category": "climate",
        "url": "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.json",
        "format": "owid",
        "columns": ["country", "year", "energy_per_capita", "renewables_share_energy"],
        "date_column": "year",
        "geo_column": "country"
    },
    
    # Sample datasets (mock data for testing)
    {
        "id": "global-temperature",
        "name": "Global Temperature Anomalies",
        "description": "Global land and ocean temperature anomalies",
        "provider": "noaa",
        "category": "climate",
        "format": "mock",
        "columns": ["year", "month", "temperature_anomaly"],
        "date_column": "year"
    },
    {
        "id": "us-census-population",
        "name": "US Census Population Estimates",
        "description": "US population estimates by state",
        "provider": "census",
        "category": "demographics",
        "format": "mock",
        "columns": ["state", "year", "population", "pop_change"],
        "date_column": "year",
        "geo_column": "state"
    },
    {
        "id": "renewable-energy-capacity",
        "name": "Renewable Energy Capacity",
        "description": "Installed renewable energy capacity by country",
        "provider": "owid",
        "category": "climate",
        "format": "mock",
        "columns": ["country", "year", "solar_capacity", "wind_capacity", "hydro_capacity"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "education-spending",
        "name": "Government Education Spending",
        "description": "Government expenditure on education as % of GDP",
        "provider": "worldbank",
        "category": "education",
        "format": "mock",
        "columns": ["country", "year", "spending_pct_gdp"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "internet-users",
        "name": "Internet Users Worldwide",
        "description": "Percentage of population using the internet",
        "provider": "worldbank",
        "category": "technology",
        "format": "mock",
        "columns": ["country", "year", "internet_users_pct"],
        "date_column": "year",
        "geo_column": "country"
    },
    {
        "id": "air-quality-index",
        "name": "Air Quality Index by City",
        "description": "Daily air quality measurements in major cities",
        "provider": "data.gov",
        "category": "health",
        "format": "mock",
        "columns": ["city", "date", "aqi", "pm25", "pm10"],
        "date_column": "date",
        "geo_column": "city"
    },
    {
        "id": "literacy-rates",
        "name": "Adult Literacy Rates",
        "description": "Adult literacy rate by country and gender",
        "provider": "worldbank",
        "category": "education",
        "format": "mock",
        "columns": ["country", "year", "literacy_rate_total", "literacy_rate_male", "literacy_rate_female"],
        "date_column": "year",
        "geo_column": "country"
    }
]


def get_all_datasets() -> List[Dict[str, Any]]:
    """Return all available datasets"""
    return [
        {
            "id": ds["id"],
            "name": ds["name"],
            "description": ds["description"],
            "provider": ds["provider"],
            "category": ds["category"],
            "columns": ds.get("columns", []),
            "has_time_series": "date_column" in ds,
            "has_geographic": "geo_column" in ds
        }
        for ds in DATASETS
    ]


def get_dataset_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
    """Get dataset metadata by ID"""
    for ds in DATASETS:
        if ds["id"] == dataset_id:
            return ds.copy()
    return None


def fetch_worldbank_data(indicator: str, limit: int = 100) -> List[Dict]:
    """Fetch data from World Bank API"""
    try:
        url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator}"
        params = {
            "format": "json",
            "per_page": limit,
            "date": "2010:2023"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if len(data) > 1 and isinstance(data[1], list):
            results = []
            for item in data[1]:
                if item.get("value") is not None:
                    results.append({
                        "country": item["country"]["value"],
                        "country_code": item["countryiso3code"],
                        "year": int(item["date"]),
                        "value": float(item["value"]),
                        "indicator": item["indicator"]["value"]
                    })
            return results
        return []
    except Exception as e:
        logger.error(f"Error fetching World Bank data: {str(e)}")
        return []


def fetch_socrata_data(url: str, limit: int = 100, offset: int = 0) -> List[Dict]:
    """Fetch data from Socrata (data.gov) API"""
    try:
        params = {
            "$limit": limit,
            "$offset": offset,
            "$order": ":id"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching Socrata data: {str(e)}")
        return []


def generate_mock_data(dataset: Dict, limit: int = 100) -> List[Dict]:
    """Generate mock data for testing purposes"""
    import random
    from datetime import datetime, timedelta
    
    data = []
    dataset_id = dataset["id"]
    
    if dataset_id == "global-temperature":
        # Generate temperature anomaly data
        start_year = 1980
        for i in range(min(limit, 500)):
            year = start_year + (i // 12)
            month = (i % 12) + 1
            # Simulate increasing temperature trend
            anomaly = random.uniform(-0.5, 0.5) + (year - start_year) * 0.02
            data.append({
                "year": year,
                "month": month,
                "temperature_anomaly": round(anomaly, 3)
            })
    
    elif dataset_id == "us-census-population":
        states = ["California", "Texas", "Florida", "New York", "Pennsylvania", 
                  "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan"]
        for state in states[:min(10, limit // 10)]:
            for year in range(2010, 2024):
                base_pop = random.randint(5000000, 40000000)
                data.append({
                    "state": state,
                    "year": year,
                    "population": base_pop + (year - 2010) * random.randint(50000, 500000),
                    "pop_change": round(random.uniform(-1, 3), 2)
                })
    
    elif dataset_id == "renewable-energy-capacity":
        countries = ["China", "USA", "Germany", "India", "Spain", "UK", "Brazil", 
                     "France", "Italy", "Canada"]
        for country in countries[:min(10, limit // 10)]:
            for year in range(2010, 2024):
                data.append({
                    "country": country,
                    "year": year,
                    "solar_capacity": random.randint(1000, 200000),
                    "wind_capacity": random.randint(5000, 300000),
                    "hydro_capacity": random.randint(10000, 400000)
                })
    
    elif dataset_id == "education-spending":
        countries = ["Norway", "Denmark", "Sweden", "Finland", "USA", "UK", 
                     "Germany", "France", "Japan", "South Korea"]
        for country in countries[:min(10, limit // 10)]:
            for year in range(2010, 2023):
                data.append({
                    "country": country,
                    "year": year,
                    "spending_pct_gdp": round(random.uniform(3.5, 7.5), 2)
                })
    
    elif dataset_id == "internet-users":
        countries = ["Iceland", "Norway", "Denmark", "Luxembourg", "Sweden", 
                     "South Korea", "Netherlands", "Finland", "Japan", "USA"]
        for country in countries[:min(10, limit // 10)]:
            for year in range(2010, 2023):
                # Simulate increasing internet penetration
                base_pct = 50 + (year - 2010) * 3
                data.append({
                    "country": country,
                    "year": year,
                    "internet_users_pct": min(98, round(base_pct + random.uniform(-5, 5), 1))
                })
    
    elif dataset_id == "air-quality-index":
        cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
                  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
        base_date = datetime(2023, 1, 1)
        for city in cities[:min(5, limit // 20)]:
            for day in range(min(100, limit // 5)):
                date = base_date + timedelta(days=day)
                data.append({
                    "city": city,
                    "date": date.strftime("%Y-%m-%d"),
                    "aqi": random.randint(20, 150),
                    "pm25": round(random.uniform(5, 35), 1),
                    "pm10": round(random.uniform(10, 50), 1)
                })
    
    elif dataset_id == "literacy-rates":
        countries = ["Finland", "Norway", "Iceland", "Denmark", "Sweden", 
                     "Netherlands", "Belgium", "Estonia", "Ireland", "Poland"]
        for country in countries[:min(10, limit // 5)]:
            for year in [2010, 2015, 2020]:
                base_rate = random.uniform(92, 99.9)
                data.append({
                    "country": country,
                    "year": year,
                    "literacy_rate_total": round(base_rate, 1),
                    "literacy_rate_male": round(base_rate + random.uniform(-1, 1), 1),
                    "literacy_rate_female": round(base_rate + random.uniform(-1, 1), 1)
                })
    
    return data[:limit]


def fetch_dataset_data(
    dataset_id: str,
    limit: int = 100,
    offset: int = 0,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    filters: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fetch data for a specific dataset with filtering
    """
    dataset = get_dataset_by_id(dataset_id)
    if not dataset:
        raise ValueError(f"Dataset {dataset_id} not found")
    
    data = []
    
    # Fetch data based on provider/format
    if dataset["format"] == "worldbank" and "indicator" in dataset:
        data = fetch_worldbank_data(dataset["indicator"], limit)
    
    elif dataset["format"] == "socrata" and "url" in dataset:
        data = fetch_socrata_data(dataset["url"], limit, offset)
    
    elif dataset["format"] == "mock":
        data = generate_mock_data(dataset, limit)
    
    else:
        # Fallback to mock data
        data = generate_mock_data(dataset, limit)
    
    # Apply date filtering if applicable
    if date_from or date_to:
        date_col = dataset.get("date_column")
        if date_col and data:
            filtered_data = []
            for row in data:
                if date_col in row:
                    try:
                        row_date = str(row[date_col])
                        if date_from and row_date < date_from:
                            continue
                        if date_to and row_date > date_to:
                            continue
                        filtered_data.append(row)
                    except:
                        filtered_data.append(row)
            data = filtered_data
    
    # Apply additional filters
    if filters:
        try:
            filter_dict = json.loads(filters)
            filtered_data = []
            for row in data:
                matches = True
                for key, value in filter_dict.items():
                    if key in row and row[key] != value:
                        matches = False
                        break
                if matches:
                    filtered_data.append(row)
            data = filtered_data
        except json.JSONDecodeError:
            logger.warning(f"Invalid filters JSON: {filters}")
    
    return {
        "dataset_id": dataset_id,
        "total": len(data),
        "limit": limit,
        "offset": offset,
        "data": data,
        "metadata": {
            "provider": dataset["provider"],
            "category": dataset["category"],
            "columns": dataset.get("columns", [])
        }
    }
