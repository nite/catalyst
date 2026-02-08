from enum import Enum
from typing import Optional, Any, List, Dict
from pydantic import BaseModel


class AggregationStrategy(str, Enum):
    """Strategy for data aggregation."""
    CLIENT = "client"
    SERVER = "server"
    AUTO = "auto"


class DataType(str, Enum):
    """Type of data in dataset."""
    TIME_SERIES = "time_series"
    CATEGORICAL = "categorical"
    NUMERICAL = "numerical"
    GEOGRAPHIC = "geographic"
    MIXED = "mixed"


class ChartType(str, Enum):
    """Recommended chart types."""
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    SCATTER = "scatter"
    HEATMAP = "heatmap"
    MAP = "map"


class DataProvider(str, Enum):
    """Supported data providers."""
    DATA_GOV = "data_gov"
    WORLD_BANK = "world_bank"
    OUR_WORLD_IN_DATA = "our_world_in_data"
    NOAA = "noaa"
    US_CENSUS = "us_census"


class DatasetMetadata(BaseModel):
    """Metadata about a dataset."""
    id: str
    name: str
    description: str
    provider: DataProvider
    category: str
    tags: List[str]
    url: Optional[str] = None
    size_estimate: Optional[int] = None  # Estimated number of rows
    update_frequency: Optional[str] = None


class ColumnInfo(BaseModel):
    """Information about a dataset column."""
    name: str
    data_type: str
    is_numeric: bool
    is_temporal: bool
    is_categorical: bool
    unique_values: Optional[int] = None
    sample_values: Optional[List[Any]] = None


class FilterConfig(BaseModel):
    """Configuration for a filter."""
    column: str
    filter_type: str  # date_range, category_select, numeric_range, multi_select
    options: Optional[List[Any]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None


class VisualizationConfig(BaseModel):
    """Auto-detected visualization configuration."""
    data_type: DataType
    recommended_chart: ChartType
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    group_by: Optional[str] = None
    filters: List[FilterConfig] = []


class DataResponse(BaseModel):
    """Response containing dataset data."""
    dataset_id: str
    total_rows: int
    returned_rows: int
    aggregation_applied: bool
    suggested_strategy: AggregationStrategy
    data_size_bytes: int
    columns: List[str]
    data: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None


class AggregationSpec(BaseModel):
    """Specification for server-side aggregation."""
    group_by: List[str]
    aggregations: Dict[str, str]  # column: function (sum, avg, count, etc.)
    filters: Optional[Dict[str, Any]] = None
    limit: Optional[int] = None
