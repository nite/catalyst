"""
Smart Visualization Analysis Engine
Analyzes datasets and recommends appropriate chart types and filter configurations
"""

import pandas as pd
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def detect_column_type(series: pd.Series, col_name: str) -> Dict[str, Any]:
    """
    Detect the type and characteristics of a column
    """
    col_info = {
        "name": col_name,
        "dtype": str(series.dtype),
        "null_count": int(series.isna().sum()),
        "unique_count": int(series.nunique()),
        "sample_values": series.dropna().head(5).tolist()
    }
    
    # Determine semantic type
    if series.dtype in ['int64', 'float64']:
        col_info["type"] = "numerical"
        col_info["min"] = float(series.min()) if not series.empty else None
        col_info["max"] = float(series.max()) if not series.empty else None
        col_info["mean"] = float(series.mean()) if not series.empty else None
        col_info["median"] = float(series.median()) if not series.empty else None
    
    elif series.dtype == 'object' or series.dtype == 'string':
        # Check if it's a date
        is_date = False
        try:
            pd.to_datetime(series.dropna().head(10), errors='raise')
            is_date = True
        except:
            pass
        
        if is_date or 'date' in col_name.lower() or 'time' in col_name.lower():
            col_info["type"] = "temporal"
        elif col_info["unique_count"] < len(series) * 0.5 and col_info["unique_count"] < 50:
            col_info["type"] = "categorical"
            col_info["categories"] = series.value_counts().head(20).to_dict()
        else:
            col_info["type"] = "text"
    
    elif pd.api.types.is_datetime64_any_dtype(series):
        col_info["type"] = "temporal"
        col_info["min"] = str(series.min()) if not series.empty else None
        col_info["max"] = str(series.max()) if not series.empty else None
    
    else:
        col_info["type"] = "unknown"
    
    # Check if it's geographic
    geo_keywords = ['country', 'state', 'city', 'region', 'location', 'place']
    if any(keyword in col_name.lower() for keyword in geo_keywords):
        col_info["is_geographic"] = True
    
    return col_info


def suggest_chart_types(columns: List[Dict[str, Any]], dataset_meta: Dict) -> List[Dict[str, Any]]:
    """
    Suggest appropriate chart types based on column types and data characteristics
    """
    suggestions = []
    
    temporal_cols = [c for c in columns if c["type"] == "temporal"]
    numerical_cols = [c for c in columns if c["type"] == "numerical"]
    categorical_cols = [c for c in columns if c["type"] == "categorical"]
    geographic_cols = [c for c in columns if c.get("is_geographic", False)]
    
    # Time series charts
    if temporal_cols and numerical_cols:
        for temp_col in temporal_cols[:1]:  # Use first temporal column
            for num_col in numerical_cols[:3]:  # Suggest for first 3 numerical columns
                suggestions.append({
                    "chart_type": "line",
                    "title": f"{num_col['name']} over time",
                    "x_axis": temp_col["name"],
                    "y_axis": num_col["name"],
                    "description": "Time series visualization showing trends over time",
                    "priority": 1
                })
    
    # Bar charts for categorical comparisons
    if categorical_cols and numerical_cols:
        for cat_col in categorical_cols[:2]:
            for num_col in numerical_cols[:2]:
                suggestions.append({
                    "chart_type": "bar",
                    "title": f"{num_col['name']} by {cat_col['name']}",
                    "x_axis": cat_col["name"],
                    "y_axis": num_col["name"],
                    "description": "Comparison across categories",
                    "priority": 2
                })
    
    # Pie/Donut charts for proportions
    if categorical_cols and numerical_cols:
        cat_col = categorical_cols[0]
        if cat_col["unique_count"] <= 10:  # Only for small number of categories
            num_col = numerical_cols[0]
            suggestions.append({
                "chart_type": "pie",
                "title": f"Distribution of {num_col['name']} by {cat_col['name']}",
                "category": cat_col["name"],
                "value": num_col["name"],
                "description": "Proportional distribution",
                "priority": 3
            })
    
    # Scatter plots for correlations
    if len(numerical_cols) >= 2:
        suggestions.append({
            "chart_type": "scatter",
            "title": f"{numerical_cols[0]['name']} vs {numerical_cols[1]['name']}",
            "x_axis": numerical_cols[0]["name"],
            "y_axis": numerical_cols[1]["name"],
            "description": "Correlation between two variables",
            "priority": 4
        })
    
    # Geographic visualizations
    if geographic_cols and numerical_cols:
        suggestions.append({
            "chart_type": "map",
            "title": f"{numerical_cols[0]['name']} by location",
            "location": geographic_cols[0]["name"],
            "value": numerical_cols[0]["name"],
            "description": "Geographic distribution",
            "priority": 2
        })
    
    # Sort by priority
    suggestions.sort(key=lambda x: x.get("priority", 99))

    if not suggestions and columns:
        numeric = [c for c in columns if c["type"] == "numerical"]
        temporal = [c for c in columns if c["type"] == "temporal"]
        if len(numeric) >= 2:
            suggestions.append({
                "chart_type": "scatter",
                "title": f"{numeric[0]['name']} vs {numeric[1]['name']}",
                "x_axis": numeric[0]["name"],
                "y_axis": numeric[1]["name"],
                "description": "Fallback scatter plot",
                "priority": 5
            })
        elif temporal and numeric:
            suggestions.append({
                "chart_type": "line",
                "title": f"{numeric[0]['name']} over time",
                "x_axis": temporal[0]["name"],
                "y_axis": numeric[0]["name"],
                "description": "Fallback time series",
                "priority": 5
            })
        elif numeric:
            suggestions.append({
                "chart_type": "bar",
                "title": f"{numeric[0]['name']} by category",
                "x_axis": columns[0]["name"],
                "y_axis": numeric[0]["name"],
                "description": "Fallback comparison chart",
                "priority": 5
            })
        else:
            suggestions.append({
                "chart_type": "bar",
                "title": "Record count by category",
                "x_axis": columns[0]["name"],
                "y_axis": columns[0]["name"],
                "description": "Fallback chart",
                "priority": 5
            })
    
    return suggestions


def generate_filter_config(columns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate filter configurations based on column types
    """
    filters = []
    
    for col in columns:
        filter_config = {
            "column": col["name"],
            "type": col["type"]
        }
        
        if col["type"] == "temporal":
            filter_config["filter_type"] = "date_range"
            filter_config["min"] = col.get("min")
            filter_config["max"] = col.get("max")
        
        elif col["type"] == "numerical":
            filter_config["filter_type"] = "range"
            filter_config["min"] = col.get("min")
            filter_config["max"] = col.get("max")
            filter_config["step"] = (col.get("max", 100) - col.get("min", 0)) / 100 if col.get("max") and col.get("min") else 1
        
        elif col["type"] == "categorical":
            filter_config["filter_type"] = "multi_select"
            filter_config["options"] = list(col.get("categories", {}).keys())[:20]  # Limit to 20 options
        
        if filter_config.get("filter_type"):
            filters.append(filter_config)
    
    return filters


def analyze_dataset(data_response: Dict[str, Any], dataset_meta: Dict) -> Dict[str, Any]:
    """
    Main analysis function that analyzes dataset and returns visualization recommendations
    """
    try:
        data = data_response.get("data", [])
        
        if not data:
            return {
                "error": "No data available for analysis",
                "dataset_id": data_response.get("dataset_id"),
                "suggestions": [],
                "filters": []
            }
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(data)
        
        # Analyze each column
        column_analysis = []
        for col_name in df.columns:
            col_info = detect_column_type(df[col_name], col_name)
            column_analysis.append(col_info)
        
        # Generate chart suggestions
        chart_suggestions = suggest_chart_types(column_analysis, dataset_meta)
        
        # Generate filter configurations
        filter_configs = generate_filter_config(column_analysis)
        
        # Dataset statistics
        stats = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "numerical_columns": len([c for c in column_analysis if c["type"] == "numerical"]),
            "categorical_columns": len([c for c in column_analysis if c["type"] == "categorical"]),
            "temporal_columns": len([c for c in column_analysis if c["type"] == "temporal"]),
            "has_time_series": any(c["type"] == "temporal" for c in column_analysis),
            "has_geographic": any(c.get("is_geographic", False) for c in column_analysis)
        }
        
        return {
            "dataset_id": data_response.get("dataset_id"),
            "statistics": stats,
            "columns": column_analysis,
            "chart_suggestions": chart_suggestions,
            "filters": filter_configs,
            "recommended_chart": chart_suggestions[0] if chart_suggestions else None
        }
    
    except Exception as e:
        logger.error(f"Error analyzing dataset: {str(e)}")
        return {
            "error": str(e),
            "dataset_id": data_response.get("dataset_id"),
            "suggestions": [],
            "filters": []
        }
