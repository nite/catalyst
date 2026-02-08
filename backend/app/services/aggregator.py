"""
Service for server-side data aggregation.
"""

import pandas as pd
from typing import List, Dict, Any
from app.core.models import AggregationSpec


class DataAggregator:
    """Handles server-side data aggregation using pandas."""
    
    def aggregate(
        self, 
        data: List[Dict[str, Any]], 
        spec: AggregationSpec
    ) -> List[Dict[str, Any]]:
        """
        Aggregate data according to specification.
        
        Args:
            data: Raw data to aggregate
            spec: Aggregation specification
            
        Returns:
            Aggregated data
        """
        if not data:
            return []
        
        df = pd.DataFrame(data)
        
        # Apply filters if specified
        if spec.filters:
            df = self._apply_filters(df, spec.filters)
        
        # Perform aggregation
        if spec.group_by:
            # Group by specified columns
            agg_dict = {}
            for column, func in spec.aggregations.items():
                if column in df.columns:
                    agg_dict[column] = self._get_agg_function(func)
            
            if agg_dict:
                grouped = df.groupby(spec.group_by).agg(agg_dict).reset_index()
                
                # Flatten column names if multi-level
                if isinstance(grouped.columns, pd.MultiIndex):
                    grouped.columns = ['_'.join(col).strip('_') for col in grouped.columns.values]
                
                df = grouped
        
        # Apply limit
        if spec.limit:
            df = df.head(spec.limit)
        
        # Convert to list of dicts
        return df.to_dict('records')
    
    def _apply_filters(self, df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """Apply filters to dataframe."""
        for column, filter_value in filters.items():
            if column not in df.columns:
                continue
            
            if isinstance(filter_value, dict):
                # Range filter
                if 'min' in filter_value:
                    df = df[df[column] >= filter_value['min']]
                if 'max' in filter_value:
                    df = df[df[column] <= filter_value['max']]
            elif isinstance(filter_value, list):
                # In filter
                df = df[df[column].isin(filter_value)]
            else:
                # Exact match
                df = df[df[column] == filter_value]
        
        return df
    
    def _get_agg_function(self, func_name: str):
        """Get pandas aggregation function by name."""
        func_map = {
            'sum': 'sum',
            'avg': 'mean',
            'mean': 'mean',
            'count': 'count',
            'min': 'min',
            'max': 'max',
            'std': 'std',
            'median': 'median'
        }
        return func_map.get(func_name.lower(), 'sum')
    
    def smart_sample(
        self, 
        data: List[Dict[str, Any]], 
        target_size: int = 10000
    ) -> List[Dict[str, Any]]:
        """
        Intelligently sample data to reduce size while maintaining distribution.
        
        Args:
            data: Full dataset
            target_size: Target number of rows
            
        Returns:
            Sampled data
        """
        if len(data) <= target_size:
            return data
        
        df = pd.DataFrame(data)
        
        # Use stratified sampling if there are categorical columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        if len(categorical_cols) > 0:
            # Sample proportionally from each category
            sample_col = categorical_cols[0]
            sampled = df.groupby(sample_col, group_keys=False).apply(
                lambda x: x.sample(min(len(x), int(target_size * len(x) / len(df))))
            )
        else:
            # Random sampling
            sampled = df.sample(n=target_size)
        
        return sampled.to_dict('records')
