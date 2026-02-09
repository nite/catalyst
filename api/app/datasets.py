"""
Dataset catalog and data fetching logic for various open data providers
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

# Curated dataset catalog from multiple providers
BASE_DATASETS = [
    # Data.gov / Socrata datasets
    {
        "id": "covid-cases-us",
        "name": "COVID-19 Cases in the United States",
        "description": "Daily COVID-19 case counts by state",
        "provider": "data.gov",
        "category": "health",
        "url": "https://data.cdc.gov/resource/9mfq-cb36.json",
        "format": "socrata",
        "columns": [
            "submission_date",
            "state",
            "tot_cases",
            "new_case",
            "tot_death",
            "new_death",
        ],
        "date_column": "submission_date",
        "geo_column": "state",
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
        "geo_column": "state",
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
        "geo_column": "country",
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
        "geo_column": "country",
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
        "geo_column": "country",
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
        "geo_column": "country",
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
        "columns": [
            "location",
            "date",
            "total_vaccinations",
            "people_vaccinated",
            "people_fully_vaccinated",
        ],
        "date_column": "date",
        "geo_column": "location",
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
        "geo_column": "country",
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
        "date_column": "year",
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
        "geo_column": "state",
    },
    {
        "id": "renewable-energy-capacity",
        "name": "Renewable Energy Capacity",
        "description": "Installed renewable energy capacity by country",
        "provider": "owid",
        "category": "climate",
        "format": "mock",
        "columns": [
            "country",
            "year",
            "solar_capacity",
            "wind_capacity",
            "hydro_capacity",
        ],
        "date_column": "year",
        "geo_column": "country",
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
        "geo_column": "country",
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
        "geo_column": "country",
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
        "geo_column": "city",
    },
    {
        "id": "literacy-rates",
        "name": "Adult Literacy Rates",
        "description": "Adult literacy rate by country and gender",
        "provider": "worldbank",
        "category": "education",
        "format": "mock",
        "columns": [
            "country",
            "year",
            "literacy_rate_total",
            "literacy_rate_male",
            "literacy_rate_female",
        ],
        "date_column": "year",
        "geo_column": "country",
    },
]

OPTIONAL_DATASETS = [
    {
        "id": "us-census-population-acs",
        "name": "US Census Population (ACS 1-year)",
        "description": "Population estimates by state from the American Community Survey",
        "provider": "census",
        "category": "demographics",
        "format": "census",
        "columns": ["state", "year", "population"],
        "date_column": "year",
        "geo_column": "state",
        "env_key": "CENSUS_API_KEY",
        "endpoint": "https://api.census.gov/data/2022/acs/acs1",
        "params": {"get": "NAME,B01003_001E", "for": "state:*"},
        "year": 2022,
    },
    {
        "id": "openweather-nyc-forecast",
        "name": "NYC Weather Forecast (OpenWeather)",
        "description": "5-day forecast for New York City",
        "provider": "openweather",
        "category": "climate",
        "format": "openweather",
        "columns": ["date_time", "temp_c", "humidity", "wind_speed", "weather"],
        "date_column": "date_time",
        "geo_column": "city",
        "env_key": "OPENWEATHER_API_KEY",
        "location": {"name": "New York", "lat": 40.7128, "lon": -74.0060},
    },
    {
        "id": "weatherapi-nyc-forecast",
        "name": "NYC Weather Forecast (WeatherAPI)",
        "description": "7-day forecast for New York City",
        "provider": "weatherapi",
        "category": "climate",
        "format": "weatherapi",
        "columns": ["date", "avg_temp_c", "max_temp_c", "min_temp_c", "humidity"],
        "date_column": "date",
        "geo_column": "city",
        "env_key": "WEATHERAPI_API_KEY",
        "query": "New York",
        "days": 7,
    },
    {
        "id": "nasa-modis-granules",
        "name": "NASA MODIS Granules (Earthdata)",
        "description": "Recent MODIS granule metadata",
        "provider": "nasa-earthdata",
        "category": "climate",
        "format": "earthdata",
        "columns": ["title", "time_start", "time_end", "updated"],
        "date_column": "time_start",
        "env_key": "NASA_EARTHDATA_TOKEN",
        "short_name": "MOD11A1",
        "temporal": "2023-01-01T00:00:00Z,2023-01-31T23:59:59Z",
    },
    {
        "id": "fred-gdp",
        "name": "US GDP (FRED)",
        "description": "Quarterly GDP observations from FRED",
        "provider": "fred",
        "category": "economy",
        "format": "fred",
        "columns": ["date", "value"],
        "date_column": "date",
        "env_key": "FRED_API_KEY",
        "series_id": "GDP",
    },
    {
        "id": "alphavantage-ibm",
        "name": "IBM Daily Stock Prices (Alpha Vantage)",
        "description": "Daily OHLC data for IBM",
        "provider": "alphavantage",
        "category": "finance",
        "format": "alphavantage",
        "columns": ["date", "open", "high", "low", "close", "volume"],
        "date_column": "date",
        "env_key": "ALPHAVANTAGE_API_KEY",
        "symbol": "IBM",
    },
    {
        "id": "openaq-latest-air-quality",
        "name": "Latest Air Quality Measurements (OpenAQ)",
        "description": "Recent air quality measurements in the US",
        "provider": "openaq",
        "category": "health",
        "format": "openaq",
        "columns": [
            "location",
            "city",
            "country",
            "parameter",
            "value",
            "unit",
            "date",
        ],
        "date_column": "date",
        "geo_column": "city",
        "env_key": "OPENAQ_API_KEY",
        "country": "US",
    },
    {
        "id": "nyc-311-recent",
        "name": "NYC 311 Service Requests (Recent)",
        "description": "Recent 311 service requests in NYC",
        "provider": "nyc-open-data",
        "category": "civic",
        "format": "socrata",
        "columns": ["created_date", "agency", "complaint_type", "borough", "status"],
        "date_column": "created_date",
        "geo_column": "borough",
        "url": "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
        "app_token_env": "SOCRATA_APP_TOKEN",
        "env_key": "SOCRATA_APP_TOKEN",
    },
    {
        "id": "gdelt-events-climate",
        "name": "GDELT Climate Events",
        "description": "Recent global events related to climate",
        "provider": "gdelt",
        "category": "news",
        "format": "gdelt",
        "columns": ["date", "source_country", "event_code", "avg_tone", "source_url"],
        "date_column": "date",
        "env_key": "GDELT_API_KEY",
        "query": "climate change",
    },
]


def env_has(env_key: Optional[str]) -> bool:
    if not env_key:
        return False
    return bool(os.getenv(env_key))


def get_dataset_catalog() -> List[Dict[str, Any]]:
    datasets = list(BASE_DATASETS)
    for ds in OPTIONAL_DATASETS:
        if env_has(ds.get("env_key")):
            datasets.append(ds)
    return datasets


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
            "has_geographic": "geo_column" in ds,
        }
        for ds in get_dataset_catalog()
    ]


def get_dataset_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
    """Get dataset metadata by ID"""
    for ds in get_dataset_catalog():
        if ds["id"] == dataset_id:
            return ds.copy()
    return None


def fetch_worldbank_data(
    indicator: str, limit: int = 100, api_key: Optional[str] = None
) -> List[Dict]:
    """Fetch data from World Bank API"""
    try:
        url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator}"
        params = {"format": "json", "per_page": limit, "date": "2010:2023"}
        if api_key:
            params["api_key"] = api_key

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        if len(data) > 1 and isinstance(data[1], list):
            results = []
            for item in data[1]:
                if item.get("value") is not None:
                    results.append(
                        {
                            "country": item["country"]["value"],
                            "country_code": item["countryiso3code"],
                            "year": int(item["date"]),
                            "value": float(item["value"]),
                            "indicator": item["indicator"]["value"],
                        }
                    )
            return results
        return []
    except Exception as e:
        logger.error(f"Error fetching World Bank data: {str(e)}")
        return []


def fetch_socrata_data(
    url: str, limit: int = 100, offset: int = 0, app_token: Optional[str] = None
) -> List[Dict]:
    """Fetch data from Socrata (data.gov) API"""
    try:
        params = {"$limit": limit, "$offset": offset, "$order": ":id"}

        headers = {}
        if app_token:
            headers["X-App-Token"] = app_token

        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()

        return response.json()
    except Exception as e:
        logger.error(f"Error fetching Socrata data: {str(e)}")
        return []


def fetch_census_data(
    endpoint: str, params: Dict[str, str], api_key: str, year: int, limit: int = 100
) -> List[Dict]:
    """Fetch data from the US Census API"""
    try:
        request_params = dict(params)
        request_params["key"] = api_key

        response = requests.get(endpoint, params=request_params, timeout=10)
        response.raise_for_status()

        data = response.json()
        if not data or len(data) < 2:
            return []

        headers = data[0]
        results = []
        for row in data[1:]:
            row_dict = dict(zip(headers, row))
            results.append(
                {
                    "state": row_dict.get("NAME"),
                    "year": year,
                    "population": int(row_dict.get("B01003_001E", 0)),
                }
            )

        return results[:limit]
    except Exception as e:
        logger.error(f"Error fetching Census data: {str(e)}")
        return []


def fetch_fred_data(series_id: str, api_key: str, limit: int = 100) -> List[Dict]:
    """Fetch data from FRED API"""
    try:
        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": api_key,
            "file_type": "json",
            "limit": limit,
            "sort_order": "desc",
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        observations = response.json().get("observations", [])
        results = []
        for obs in observations:
            value = obs.get("value")
            if value in (".", None):
                continue
            results.append({"date": obs.get("date"), "value": float(value)})

        return results
    except Exception as e:
        logger.error(f"Error fetching FRED data: {str(e)}")
        return []


def fetch_alpha_vantage_data(symbol: str, api_key: str, limit: int = 100) -> List[Dict]:
    """Fetch data from Alpha Vantage API"""
    try:
        url = "https://www.alphavantage.co/query"
        params = {"function": "TIME_SERIES_DAILY", "symbol": symbol, "apikey": api_key}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        time_series = response.json().get("Time Series (Daily)", {})
        results = []
        for date, values in time_series.items():
            results.append(
                {
                    "date": date,
                    "open": float(values.get("1. open", 0)),
                    "high": float(values.get("2. high", 0)),
                    "low": float(values.get("3. low", 0)),
                    "close": float(values.get("4. close", 0)),
                    "volume": int(values.get("5. volume", 0)),
                }
            )

        results.sort(key=lambda x: x["date"], reverse=True)
        return results[:limit]
    except Exception as e:
        logger.error(f"Error fetching Alpha Vantage data: {str(e)}")
        return []


def fetch_openweather_forecast(
    api_key: str, lat: float, lon: float, limit: int = 100
) -> List[Dict]:
    """Fetch 5-day forecast from OpenWeather"""
    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        payload = response.json()
        city_name = payload.get("city", {}).get("name", "Unknown")
        results = []
        for entry in payload.get("list", []):
            weather_desc = None
            weather_list = entry.get("weather", [])
            if weather_list:
                weather_desc = weather_list[0].get("description")
            results.append(
                {
                    "date_time": entry.get("dt_txt"),
                    "temp_c": entry.get("main", {}).get("temp"),
                    "humidity": entry.get("main", {}).get("humidity"),
                    "wind_speed": entry.get("wind", {}).get("speed"),
                    "weather": weather_desc,
                    "city": city_name,
                }
            )

        return results[:limit]
    except Exception as e:
        logger.error(f"Error fetching OpenWeather data: {str(e)}")
        return []


def fetch_weatherapi_forecast(api_key: str, query: str, days: int = 7) -> List[Dict]:
    """Fetch forecast data from WeatherAPI"""
    try:
        url = "https://api.weatherapi.com/v1/forecast.json"
        params = {"key": api_key, "q": query, "days": days, "aqi": "no", "alerts": "no"}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        payload = response.json()
        city = payload.get("location", {}).get("name", query)
        results = []
        for day in payload.get("forecast", {}).get("forecastday", []):
            day_stats = day.get("day", {})
            results.append(
                {
                    "date": day.get("date"),
                    "avg_temp_c": day_stats.get("avgtemp_c"),
                    "max_temp_c": day_stats.get("maxtemp_c"),
                    "min_temp_c": day_stats.get("mintemp_c"),
                    "humidity": day_stats.get("avghumidity"),
                    "city": city,
                }
            )

        return results
    except Exception as e:
        logger.error(f"Error fetching WeatherAPI data: {str(e)}")
        return []


def fetch_openaq_measurements(
    api_key: str, limit: int = 100, country: Optional[str] = None
) -> List[Dict]:
    """Fetch measurements from OpenAQ"""
    try:
        url = "https://api.openaq.org/v2/measurements"
        params = {"limit": limit, "sort": "desc", "order_by": "datetime"}
        if country:
            params["country"] = country

        headers = {"X-API-Key": api_key}
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()

        results = []
        for entry in response.json().get("results", []):
            results.append(
                {
                    "location": entry.get("location"),
                    "city": entry.get("city"),
                    "country": entry.get("country"),
                    "parameter": entry.get("parameter"),
                    "value": entry.get("value"),
                    "unit": entry.get("unit"),
                    "date": entry.get("date", {}).get("utc"),
                }
            )

        return results
    except Exception as e:
        logger.error(f"Error fetching OpenAQ data: {str(e)}")
        return []


def fetch_nasa_earthdata_granules(
    token: str, short_name: str, temporal: str, limit: int = 100
) -> List[Dict]:
    """Fetch granule metadata from NASA Earthdata CMR"""
    try:
        url = "https://cmr.earthdata.nasa.gov/search/granules.json"
        params = {"short_name": short_name, "temporal": temporal, "page_size": limit}
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()

        entries = response.json().get("feed", {}).get("entry", [])
        results = []
        for entry in entries:
            results.append(
                {
                    "title": entry.get("title"),
                    "time_start": entry.get("time_start"),
                    "time_end": entry.get("time_end"),
                    "updated": entry.get("updated"),
                }
            )

        return results
    except Exception as e:
        logger.error(f"Error fetching NASA Earthdata: {str(e)}")
        return []


def fetch_gdelt_events(query: str, api_key: str, limit: int = 100) -> List[Dict]:
    """Fetch events from GDELT"""
    try:
        url = "https://api.gdeltproject.org/api/v2/events/search"
        params = {"query": query, "format": "json", "maxrecords": limit}
        if api_key:
            params["api_key"] = api_key

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        events = response.json().get("events", [])
        results = []
        for event in events:
            results.append(
                {
                    "date": event.get("SQLDATE"),
                    "source_country": event.get("ActionGeo_CountryCode"),
                    "event_code": event.get("EventCode"),
                    "avg_tone": event.get("AvgTone"),
                    "source_url": event.get("SOURCEURL"),
                }
            )

        return results
    except Exception as e:
        logger.error(f"Error fetching GDELT data: {str(e)}")
        return []


def generate_mock_data(dataset: Dict, limit: int = 100) -> List[Dict]:
    """Generate mock data for testing purposes"""
    import random
    from datetime import datetime, timedelta

    data = []
    dataset_id = dataset["id"]

    # World Bank datasets - generate generic mock data
    if dataset_id == "world-gdp":
        countries = [
            "United States",
            "China",
            "Japan",
            "Germany",
            "United Kingdom",
            "France",
            "India",
            "Italy",
            "Brazil",
            "Canada",
        ]
        num_countries = max(
            1, min(len(countries), limit // 14 + 1)
        )  # At least 1, adjust for years
        for country in countries[:num_countries]:
            for year in range(2010, 2024):
                data.append(
                    {
                        "country": country,
                        "country_code": country[:3].upper(),
                        "year": year,
                        "value": random.uniform(30000, 70000),
                        "indicator": "GDP per capita (current US$)",
                    }
                )

    elif dataset_id == "world-population":
        countries = [
            "China",
            "India",
            "United States",
            "Indonesia",
            "Pakistan",
            "Brazil",
            "Nigeria",
            "Bangladesh",
            "Russia",
            "Mexico",
        ]
        num_countries = max(1, min(len(countries), limit // 14 + 1))
        for country in countries[:num_countries]:
            base_pop = random.randint(50000000, 1400000000)
            for year in range(2010, 2024):
                data.append(
                    {
                        "country": country,
                        "country_code": country[:3].upper(),
                        "year": year,
                        "value": base_pop
                        + (year - 2010) * random.randint(1000000, 20000000),
                        "indicator": "Population, total",
                    }
                )

    elif dataset_id == "world-life-expectancy":
        countries = [
            "Japan",
            "Switzerland",
            "Singapore",
            "Spain",
            "Italy",
            "Australia",
            "South Korea",
            "Iceland",
            "Israel",
            "Sweden",
        ]
        num_countries = max(1, min(len(countries), limit // 14 + 1))
        for country in countries[:num_countries]:
            for year in range(2010, 2024):
                data.append(
                    {
                        "country": country,
                        "country_code": country[:3].upper(),
                        "year": year,
                        "value": round(random.uniform(78, 85), 1),
                        "indicator": "Life expectancy at birth, total (years)",
                    }
                )

    elif dataset_id == "world-co2-emissions":
        countries = [
            "Qatar",
            "Trinidad and Tobago",
            "Kuwait",
            "United Arab Emirates",
            "Bahrain",
            "Brunei",
            "Saudi Arabia",
            "Australia",
            "United States",
            "Canada",
        ]
        num_countries = max(1, min(len(countries), limit // 14 + 1))
        for country in countries[:num_countries]:
            for year in range(2010, 2024):
                data.append(
                    {
                        "country": country,
                        "country_code": country[:3].upper(),
                        "year": year,
                        "value": round(random.uniform(5, 40), 2),
                        "indicator": "CO2 emissions (metric tons per capita)",
                    }
                )

    elif dataset_id == "global-temperature":
        # Generate temperature anomaly data
        start_year = 1980
        for i in range(min(limit, 500)):
            year = start_year + (i // 12)
            month = (i % 12) + 1
            # Simulate increasing temperature trend
            anomaly = random.uniform(-0.5, 0.5) + (year - start_year) * 0.02
            data.append(
                {"year": year, "month": month, "temperature_anomaly": round(anomaly, 3)}
            )

    elif dataset_id == "us-census-population":
        states = [
            "California",
            "Texas",
            "Florida",
            "New York",
            "Pennsylvania",
            "Illinois",
            "Ohio",
            "Georgia",
            "North Carolina",
            "Michigan",
        ]
        num_states = max(1, min(len(states), limit // 14 + 1))
        for state in states[:num_states]:
            for year in range(2010, 2024):
                base_pop = random.randint(5000000, 40000000)
                data.append(
                    {
                        "state": state,
                        "year": year,
                        "population": base_pop
                        + (year - 2010) * random.randint(50000, 500000),
                        "pop_change": round(random.uniform(-1, 3), 2),
                    }
                )

    elif dataset_id == "renewable-energy-capacity":
        countries = [
            "China",
            "USA",
            "Germany",
            "India",
            "Spain",
            "UK",
            "Brazil",
            "France",
            "Italy",
            "Canada",
        ]
        num_countries = max(1, min(len(countries), limit // 14 + 1))
        for country in countries[:num_countries]:
            for year in range(2010, 2024):
                data.append(
                    {
                        "country": country,
                        "year": year,
                        "solar_capacity": random.randint(1000, 200000),
                        "wind_capacity": random.randint(5000, 300000),
                        "hydro_capacity": random.randint(10000, 400000),
                    }
                )

    elif dataset_id == "education-spending":
        countries = [
            "Norway",
            "Denmark",
            "Sweden",
            "Finland",
            "USA",
            "UK",
            "Germany",
            "France",
            "Japan",
            "South Korea",
        ]
        num_countries = max(1, min(len(countries), limit // 13 + 1))
        for country in countries[:num_countries]:
            for year in range(2010, 2023):
                data.append(
                    {
                        "country": country,
                        "year": year,
                        "spending_pct_gdp": round(random.uniform(3.5, 7.5), 2),
                    }
                )

    elif dataset_id == "internet-users":
        countries = [
            "Iceland",
            "Norway",
            "Denmark",
            "Luxembourg",
            "Sweden",
            "South Korea",
            "Netherlands",
            "Finland",
            "Japan",
            "USA",
        ]
        num_countries = max(1, min(len(countries), limit // 13 + 1))
        for country in countries[:num_countries]:
            for year in range(2010, 2023):
                # Simulate increasing internet penetration
                base_pct = 50 + (year - 2010) * 3
                data.append(
                    {
                        "country": country,
                        "year": year,
                        "internet_users_pct": min(
                            98, round(base_pct + random.uniform(-5, 5), 1)
                        ),
                    }
                )

    elif dataset_id == "air-quality-index":
        cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "Houston",
            "Phoenix",
            "Philadelphia",
            "San Antonio",
            "San Diego",
            "Dallas",
            "San Jose",
        ]
        base_date = datetime(2023, 1, 1)
        num_cities = max(1, min(5, (limit // 20) + 1))
        num_days = max(1, min(100, (limit // num_cities)))
        for city in cities[:num_cities]:
            for day in range(num_days):
                date = base_date + timedelta(days=day)
                data.append(
                    {
                        "city": city,
                        "date": date.strftime("%Y-%m-%d"),
                        "aqi": random.randint(20, 150),
                        "pm25": round(random.uniform(5, 35), 1),
                        "pm10": round(random.uniform(10, 50), 1),
                    }
                )

    elif dataset_id == "literacy-rates":
        countries = [
            "Finland",
            "Norway",
            "Iceland",
            "Denmark",
            "Sweden",
            "Netherlands",
            "Belgium",
            "Estonia",
            "Ireland",
            "Poland",
        ]
        num_countries = max(1, min(10, (limit // 3) + 1))
        for country in countries[:num_countries]:
            for year in [2010, 2015, 2020]:
                base_rate = random.uniform(92, 99.9)
                data.append(
                    {
                        "country": country,
                        "year": year,
                        "literacy_rate_total": round(base_rate, 1),
                        "literacy_rate_male": round(
                            base_rate + random.uniform(-1, 1), 1
                        ),
                        "literacy_rate_female": round(
                            base_rate + random.uniform(-1, 1), 1
                        ),
                    }
                )

    if not data:
        columns = dataset.get("columns", [])
        start_date = datetime(2020, 1, 1)
        states = ["California", "Texas", "Florida", "New York", "Illinois"]
        countries = ["USA", "Canada", "UK", "Germany", "Japan"]
        cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]

        for idx in range(limit):
            row = {}
            for col in columns:
                col_lower = col.lower()
                if "date" in col_lower:
                    row[col] = (start_date + timedelta(days=idx)).strftime("%Y-%m-%d")
                elif "year" in col_lower:
                    row[col] = 2010 + (idx % 14)
                elif "month" in col_lower:
                    row[col] = (idx % 12) + 1
                elif "state" in col_lower:
                    row[col] = states[idx % len(states)]
                elif "country" in col_lower:
                    row[col] = countries[idx % len(countries)]
                elif "city" in col_lower:
                    row[col] = cities[idx % len(cities)]
                elif any(
                    token in col_lower
                    for token in [
                        "rate",
                        "value",
                        "count",
                        "total",
                        "cases",
                        "index",
                        "pct",
                        "percent",
                    ]
                ):
                    row[col] = round(random.uniform(10, 1000), 2)
                else:
                    row[col] = f"Category {(idx % 5) + 1}"
            data.append(row)

    return data[:limit]


def fetch_dataset_data(
    dataset_id: str,
    limit: int = 100,
    offset: int = 0,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    filters: Optional[str] = None,
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
        data = fetch_worldbank_data(
            dataset["indicator"], limit, api_key=os.getenv("WORLD_BANK_API_KEY")
        )
        # Fallback to mock data if API fails
        if not data:
            logger.warning(f"World Bank API failed for {dataset_id}, using mock data")
            data = generate_mock_data(dataset, limit)

    elif dataset["format"] == "socrata" and "url" in dataset:
        app_token = os.getenv(dataset.get("app_token_env", ""))
        data = fetch_socrata_data(dataset["url"], limit, offset, app_token)
        # Fallback to mock data if API fails
        if not data:
            logger.warning(f"Socrata API failed for {dataset_id}, using mock data")
            data = generate_mock_data(dataset, limit)

    elif dataset["format"] == "census":
        data = fetch_census_data(
            endpoint=dataset.get("endpoint", ""),
            params=dataset.get("params", {}),
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            year=dataset.get("year", datetime.utcnow().year),
            limit=limit,
        )

    elif dataset["format"] == "fred":
        data = fetch_fred_data(
            series_id=dataset.get("series_id", ""),
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            limit=limit,
        )

    elif dataset["format"] == "alphavantage":
        data = fetch_alpha_vantage_data(
            symbol=dataset.get("symbol", ""),
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            limit=limit,
        )

    elif dataset["format"] == "openweather":
        location = dataset.get("location", {})
        data = fetch_openweather_forecast(
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            lat=location.get("lat", 0),
            lon=location.get("lon", 0),
            limit=limit,
        )

    elif dataset["format"] == "weatherapi":
        data = fetch_weatherapi_forecast(
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            query=dataset.get("query", ""),
            days=dataset.get("days", 7),
        )

    elif dataset["format"] == "openaq":
        data = fetch_openaq_measurements(
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            limit=limit,
            country=dataset.get("country"),
        )

    elif dataset["format"] == "earthdata":
        data = fetch_nasa_earthdata_granules(
            token=os.getenv(dataset.get("env_key", ""), ""),
            short_name=dataset.get("short_name", ""),
            temporal=dataset.get("temporal", ""),
            limit=limit,
        )

    elif dataset["format"] == "gdelt":
        data = fetch_gdelt_events(
            query=dataset.get("query", ""),
            api_key=os.getenv(dataset.get("env_key", ""), ""),
            limit=limit,
        )

    elif dataset["format"] == "mock":
        data = generate_mock_data(dataset, limit)

    else:
        # Fallback to mock data
        data = generate_mock_data(dataset, limit)

    if not data:
        logger.warning(
            f"Dataset fetch returned empty for {dataset_id}, using mock data"
        )
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
                    except (TypeError, ValueError):
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
                    if key.endswith("_min"):
                        base_key = key[:-4]
                        if base_key in row:
                            try:
                                if float(row[base_key]) < float(value):
                                    matches = False
                                    break
                            except (ValueError, TypeError):
                                matches = False
                                break
                        continue

                    if key.endswith("_max"):
                        base_key = key[:-4]
                        if base_key in row:
                            try:
                                if float(row[base_key]) > float(value):
                                    matches = False
                                    break
                            except (ValueError, TypeError):
                                matches = False
                                break
                        continue

                    if key.endswith("_from"):
                        base_key = key[:-5]
                        if base_key in row:
                            row_value = str(row[base_key])
                            if str(row_value) < str(value):
                                matches = False
                                break
                        continue

                    if key.endswith("_to"):
                        base_key = key[:-3]
                        if base_key in row:
                            row_value = str(row[base_key])
                            if str(row_value) > str(value):
                                matches = False
                                break
                        continue

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
            "columns": dataset.get("columns", []),
        },
    }
