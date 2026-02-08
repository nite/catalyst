"""
Dataset catalog with curated datasets from multiple providers.
"""

from app.core.models import DatasetMetadata, DataProvider

# Curated list of popular datasets
DATASETS = [
    # Data.gov / Socrata datasets
    DatasetMetadata(
        id="sf-police-incidents",
        name="San Francisco Police Incidents",
        description="Police incident reports from San Francisco Police Department",
        provider=DataProvider.DATA_GOV,
        category="Public Safety",
        tags=["crime", "police", "san-francisco"],
        url="https://data.sfgov.org/resource/wg3w-h783.json",
        size_estimate=150000,
        update_frequency="daily"
    ),
    DatasetMetadata(
        id="nyc-311-calls",
        name="NYC 311 Service Requests",
        description="All 311 service requests from NYC",
        provider=DataProvider.DATA_GOV,
        category="Public Services",
        tags=["311", "nyc", "complaints"],
        url="https://data.cityofnewyork.us/resource/erm2-nwe9.json",
        size_estimate=500000,
        update_frequency="daily"
    ),
    
    # World Bank datasets
    DatasetMetadata(
        id="wb-gdp-per-capita",
        name="GDP per Capita (World Bank)",
        description="GDP per capita for all countries over time",
        provider=DataProvider.WORLD_BANK,
        category="Economics",
        tags=["gdp", "economy", "world"],
        url="https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD",
        size_estimate=15000,
        update_frequency="annually"
    ),
    DatasetMetadata(
        id="wb-population",
        name="World Population Data",
        description="Total population by country from World Bank",
        provider=DataProvider.WORLD_BANK,
        category="Demographics",
        tags=["population", "demographics", "world"],
        url="https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL",
        size_estimate=15000,
        update_frequency="annually"
    ),
    DatasetMetadata(
        id="wb-life-expectancy",
        name="Life Expectancy at Birth",
        description="Average life expectancy by country",
        provider=DataProvider.WORLD_BANK,
        category="Health",
        tags=["health", "life-expectancy", "demographics"],
        url="https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN",
        size_estimate=15000,
        update_frequency="annually"
    ),
    DatasetMetadata(
        id="wb-internet-users",
        name="Internet Users (%)",
        description="Percentage of population using the internet",
        provider=DataProvider.WORLD_BANK,
        category="Technology",
        tags=["internet", "technology", "digital"],
        url="https://api.worldbank.org/v2/country/all/indicator/IT.NET.USER.ZS",
        size_estimate=12000,
        update_frequency="annually"
    ),
    
    # Our World in Data
    DatasetMetadata(
        id="owid-covid-cases",
        name="COVID-19 Cases and Deaths",
        description="Daily COVID-19 cases and deaths by country from Our World in Data",
        provider=DataProvider.OUR_WORLD_IN_DATA,
        category="Health",
        tags=["covid-19", "pandemic", "health"],
        url="https://covid.ourworldindata.org/data/owid-covid-data.json",
        size_estimate=200000,
        update_frequency="daily"
    ),
    DatasetMetadata(
        id="owid-co2-emissions",
        name="CO2 Emissions by Country",
        description="CO2 emissions data from Our World in Data",
        provider=DataProvider.OUR_WORLD_IN_DATA,
        category="Environment",
        tags=["climate", "co2", "emissions"],
        url="https://github.com/owid/co2-data/raw/master/owid-co2-data.json",
        size_estimate=50000,
        update_frequency="annually"
    ),
    
    # NOAA Climate data
    DatasetMetadata(
        id="noaa-temperature",
        name="Global Temperature Anomalies",
        description="Global surface temperature anomalies from NOAA",
        provider=DataProvider.NOAA,
        category="Climate",
        tags=["climate", "temperature", "global-warming"],
        url="https://www.ncei.noaa.gov/data/global-summary-of-the-month/access/",
        size_estimate=100000,
        update_frequency="monthly"
    ),
    
    # US Census Bureau
    DatasetMetadata(
        id="census-population-estimates",
        name="US Population Estimates",
        description="Annual population estimates for US states",
        provider=DataProvider.US_CENSUS,
        category="Demographics",
        tags=["population", "us", "states"],
        url="https://api.census.gov/data/2021/pep/population",
        size_estimate=5000,
        update_frequency="annually"
    ),
    DatasetMetadata(
        id="census-median-income",
        name="US Median Household Income",
        description="Median household income by state",
        provider=DataProvider.US_CENSUS,
        category="Economics",
        tags=["income", "economics", "us"],
        url="https://api.census.gov/data/2021/acs/acs1",
        size_estimate=3000,
        update_frequency="annually"
    ),
    
    # Additional Socrata datasets
    DatasetMetadata(
        id="chicago-crimes",
        name="Chicago Crime Data",
        description="Reported incidents of crime in Chicago",
        provider=DataProvider.DATA_GOV,
        category="Public Safety",
        tags=["crime", "chicago", "police"],
        url="https://data.cityofchicago.org/resource/ijzp-q8t2.json",
        size_estimate=800000,
        update_frequency="daily"
    ),
    DatasetMetadata(
        id="seattle-police-responses",
        name="Seattle Police Response Times",
        description="Seattle Police Department 911 incident response",
        provider=DataProvider.DATA_GOV,
        category="Public Safety",
        tags=["police", "seattle", "response-time"],
        url="https://data.seattle.gov/resource/3k2p-39jp.json",
        size_estimate=200000,
        update_frequency="daily"
    ),
    DatasetMetadata(
        id="la-parking-citations",
        name="LA Parking Citations",
        description="Parking citations issued in Los Angeles",
        provider=DataProvider.DATA_GOV,
        category="Transportation",
        tags=["parking", "citations", "los-angeles"],
        url="https://data.lacity.org/resource/wjz9-h9np.json",
        size_estimate=1000000,
        update_frequency="daily"
    ),
    DatasetMetadata(
        id="austin-traffic-incidents",
        name="Austin Traffic Incidents",
        description="Real-time traffic incident reports in Austin, TX",
        provider=DataProvider.DATA_GOV,
        category="Transportation",
        tags=["traffic", "austin", "incidents"],
        url="https://data.austintexas.gov/resource/dx9v-zd7x.json",
        size_estimate=50000,
        update_frequency="real-time"
    ),
]


def get_all_datasets() -> list[DatasetMetadata]:
    """Get all available datasets."""
    return DATASETS


def get_dataset_by_id(dataset_id: str) -> DatasetMetadata | None:
    """Get a specific dataset by ID."""
    for dataset in DATASETS:
        if dataset.id == dataset_id:
            return dataset
    return None
