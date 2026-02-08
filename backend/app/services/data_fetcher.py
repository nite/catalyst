"""
Service for fetching data from various providers.
"""

import httpx
import json
import sys
from typing import Any, Dict, List
from app.core.models import DataProvider


class DataFetcher:
    """Fetches data from various open data providers."""
    
    def __init__(self):
        self.timeout = 30.0
    
    async def fetch_data(self, provider: DataProvider, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """
        Fetch data from a provider.
        
        Args:
            provider: The data provider
            url: The API URL
            limit: Optional limit on number of records
            
        Returns:
            List of data records
        """
        if provider == DataProvider.DATA_GOV:
            return await self._fetch_socrata(url, limit)
        elif provider == DataProvider.WORLD_BANK:
            return await self._fetch_world_bank(url, limit)
        elif provider == DataProvider.OUR_WORLD_IN_DATA:
            return await self._fetch_owid(url, limit)
        elif provider == DataProvider.NOAA:
            return await self._fetch_noaa(url, limit)
        elif provider == DataProvider.US_CENSUS:
            return await self._fetch_census(url, limit)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    async def _fetch_socrata(self, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch data from Socrata API (data.gov and city portals)."""
        params = {}
        if limit:
            params['$limit'] = min(limit, 50000)  # Socrata max
        else:
            params['$limit'] = 10000  # Default reasonable limit
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Ensure it's a list
            if not isinstance(data, list):
                return []
            
            return data
    
    async def _fetch_world_bank(self, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch data from World Bank API."""
        params = {
            'format': 'json',
            'per_page': min(limit, 10000) if limit else 10000,
            'date': '2000:2023'  # Last 23 years
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # World Bank returns [metadata, data]
            if isinstance(data, list) and len(data) > 1:
                records = data[1]
                # Transform to simpler format
                transformed = []
                for record in records:
                    if record and record.get('value') is not None:
                        transformed.append({
                            'country': record.get('country', {}).get('value', 'Unknown'),
                            'country_code': record.get('countryiso3code', ''),
                            'year': int(record.get('date', 0)),
                            'value': float(record.get('value', 0)),
                            'indicator': record.get('indicator', {}).get('value', '')
                        })
                return transformed
            
            return []
    
    async def _fetch_owid(self, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch data from Our World in Data."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # OWID COVID data is structured as {country: {data: []}}
            if isinstance(data, dict):
                records = []
                for country, country_data in data.items():
                    if isinstance(country_data, dict) and 'data' in country_data:
                        for entry in country_data['data']:
                            entry['country'] = country
                            records.append(entry)
                    # Some OWID datasets have direct array data
                    elif isinstance(country_data, list):
                        for entry in country_data:
                            entry['country'] = country
                            records.append(entry)
                
                if limit:
                    records = records[:limit]
                
                return records
            
            return []
    
    async def _fetch_noaa(self, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """
        Fetch data from NOAA.
        Note: This is a simplified implementation. Real NOAA API requires authentication.
        """
        # For demo purposes, return sample data
        # In production, you'd use the actual NOAA API with credentials
        sample_data = [
            {
                "date": f"2023-{month:02d}-01",
                "temperature_anomaly": round(-0.5 + (month * 0.15), 2),
                "station": "Global"
            }
            for month in range(1, 13)
        ]
        
        return sample_data[:limit] if limit else sample_data
    
    async def _fetch_census(self, url: str, limit: int = None) -> List[Dict[str, Any]]:
        """
        Fetch data from US Census Bureau API.
        Note: Some endpoints require API key.
        """
        # Sample implementation - real one would use actual Census API
        sample_data = [
            {
                "state": "California",
                "state_code": "06",
                "population": 39538223,
                "year": 2021
            },
            {
                "state": "Texas", 
                "state_code": "48",
                "population": 29145505,
                "year": 2021
            },
            {
                "state": "Florida",
                "state_code": "12", 
                "population": 21538187,
                "year": 2021
            },
            {
                "state": "New York",
                "state_code": "36",
                "population": 20201249,
                "year": 2021
            },
            {
                "state": "Pennsylvania",
                "state_code": "42",
                "population": 13002700,
                "year": 2021
            }
        ]
        
        return sample_data[:limit] if limit else sample_data
    
    def estimate_data_size(self, data: List[Dict[str, Any]]) -> int:
        """Estimate the size of data in bytes."""
        if not data:
            return 0
        
        # Estimate by serializing a sample and extrapolating
        sample_size = min(100, len(data))
        sample = data[:sample_size]
        sample_bytes = len(json.dumps(sample).encode('utf-8'))
        
        # Extrapolate to full dataset
        estimated_size = int((sample_bytes / sample_size) * len(data))
        
        return estimated_size
