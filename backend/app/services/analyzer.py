"""
Service for analyzing datasets and suggesting visualizations.
"""

import pandas as pd
from typing import List, Dict, Any
from app.core.models import (
    DataType, ChartType, ColumnInfo, FilterConfig, 
    VisualizationConfig, AggregationStrategy
)
from app.core.config import settings


class DataAnalyzer:
    """Analyzes datasets and suggests visualization configurations."""
    
    def analyze_columns(self, data: List[Dict[str, Any]]) -> List[ColumnInfo]:
        """Analyze column types and characteristics."""
        if not data:
            return []
        
        df = pd.DataFrame(data)
        columns_info = []
        
        for column in df.columns:
            col_data = df[column]
            
            # Determine data type
            is_numeric = pd.api.types.is_numeric_dtype(col_data)
            is_temporal = pd.api.types.is_datetime64_any_dtype(col_data)
            
            # Try to detect if it's a date string
            if not is_temporal and col_data.dtype == 'object':
                try:
                    pd.to_datetime(col_data.dropna().head(10))
                    is_temporal = True
                except:
                    is_temporal = False
            
            # Determine if categorical (few unique values relative to total)
            unique_count = col_data.nunique()
            is_categorical = (
                not is_numeric and 
                unique_count < min(50, len(col_data) * 0.1)
            )
            
            # Get sample values
            sample_values = col_data.dropna().head(5).tolist()
            
            columns_info.append(ColumnInfo(
                name=column,
                data_type=str(col_data.dtype),
                is_numeric=is_numeric,
                is_temporal=is_temporal,
                is_categorical=is_categorical,
                unique_values=unique_count,
                sample_values=sample_values
            ))
        
        return columns_info
    
    def detect_data_type(self, columns: List[ColumnInfo]) -> DataType:
        """Detect the primary data type of the dataset."""
        has_temporal = any(col.is_temporal for col in columns)
        has_numeric = any(col.is_numeric for col in columns)
        has_categorical = any(col.is_categorical for col in columns)
        
        # Check for geographic data
        geographic_keywords = ['lat', 'lon', 'latitude', 'longitude', 'geo', 'location']
        has_geographic = any(
            any(keyword in col.name.lower() for keyword in geographic_keywords)
            for col in columns
        )
        
        if has_geographic:
            return DataType.GEOGRAPHIC
        elif has_temporal and has_numeric:
            return DataType.TIME_SERIES
        elif has_categorical and has_numeric:
            return DataType.CATEGORICAL
        elif has_numeric:
            return DataType.NUMERICAL
        else:
            return DataType.MIXED
    
    def suggest_chart_type(self, data_type: DataType, columns: List[ColumnInfo]) -> ChartType:
        """Suggest the best chart type based on data characteristics."""
        if data_type == DataType.TIME_SERIES:
            return ChartType.LINE
        elif data_type == DataType.GEOGRAPHIC:
            return ChartType.MAP
        elif data_type == DataType.CATEGORICAL:
            # If few categories, use pie chart; otherwise bar chart
            categorical_cols = [c for c in columns if c.is_categorical]
            if categorical_cols and categorical_cols[0].unique_values and categorical_cols[0].unique_values < 10:
                return ChartType.PIE
            return ChartType.BAR
        elif data_type == DataType.NUMERICAL:
            # If two numeric columns, suggest scatter
            numeric_cols = [c for c in columns if c.is_numeric]
            if len(numeric_cols) >= 2:
                return ChartType.SCATTER
            return ChartType.BAR
        else:
            return ChartType.BAR
    
    def generate_filters(self, columns: List[ColumnInfo]) -> List[FilterConfig]:
        """Generate filter configurations based on columns."""
        filters = []
        
        for col in columns:
            if col.is_temporal:
                filters.append(FilterConfig(
                    column=col.name,
                    filter_type="date_range"
                ))
            elif col.is_categorical and col.unique_values and col.unique_values < 50:
                filters.append(FilterConfig(
                    column=col.name,
                    filter_type="multi_select",
                    options=col.sample_values[:20] if col.sample_values else []
                ))
            elif col.is_numeric:
                filters.append(FilterConfig(
                    column=col.name,
                    filter_type="numeric_range"
                ))
        
        return filters
    
    def suggest_axes(self, columns: List[ColumnInfo], chart_type: ChartType) -> tuple[str | None, str | None]:
        """Suggest x and y axes for the chart."""
        temporal_cols = [c for c in columns if c.is_temporal]
        numeric_cols = [c for c in columns if c.is_numeric]
        categorical_cols = [c for c in columns if c.is_categorical]
        
        x_axis = None
        y_axis = None
        
        if chart_type == ChartType.LINE:
            # Time series: time on x-axis, numeric on y-axis
            x_axis = temporal_cols[0].name if temporal_cols else None
            y_axis = numeric_cols[0].name if numeric_cols else None
        elif chart_type == ChartType.BAR:
            # Bar chart: category on x-axis, numeric on y-axis
            x_axis = categorical_cols[0].name if categorical_cols else None
            y_axis = numeric_cols[0].name if numeric_cols else None
        elif chart_type == ChartType.SCATTER:
            # Scatter: numeric on both axes
            if len(numeric_cols) >= 2:
                x_axis = numeric_cols[0].name
                y_axis = numeric_cols[1].name
        elif chart_type == ChartType.PIE:
            # Pie chart uses category and value
            x_axis = categorical_cols[0].name if categorical_cols else None
            y_axis = numeric_cols[0].name if numeric_cols else None
        
        return x_axis, y_axis
    
    def analyze_dataset(self, data: List[Dict[str, Any]]) -> VisualizationConfig:
        """Analyze dataset and return complete visualization configuration."""
        columns = self.analyze_columns(data)
        data_type = self.detect_data_type(columns)
        chart_type = self.suggest_chart_type(data_type, columns)
        filters = self.generate_filters(columns)
        x_axis, y_axis = self.suggest_axes(columns, chart_type)
        
        # Suggest group_by for aggregation
        categorical_cols = [c for c in columns if c.is_categorical]
        group_by = categorical_cols[0].name if categorical_cols else None
        
        return VisualizationConfig(
            data_type=data_type,
            recommended_chart=chart_type,
            x_axis=x_axis,
            y_axis=y_axis,
            group_by=group_by,
            filters=filters
        )
    
    def determine_aggregation_strategy(
        self, 
        row_count: int, 
        data_size_bytes: int
    ) -> AggregationStrategy:
        """Determine whether to use client-side or server-side aggregation."""
        if (row_count > settings.large_dataset_row_threshold or 
            data_size_bytes > settings.large_dataset_size_threshold):
            return AggregationStrategy.SERVER
        else:
            return AggregationStrategy.CLIENT
