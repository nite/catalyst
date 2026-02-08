import pytest
from app.services.analyzer import DataAnalyzer
from app.core.models import DataType, ChartType


def test_analyze_columns():
    """Test column analysis."""
    analyzer = DataAnalyzer()
    
    data = [
        {"date": "2023-01-01", "value": 100, "category": "A"},
        {"date": "2023-01-02", "value": 200, "category": "B"},
        {"date": "2023-01-03", "value": 150, "category": "A"},
    ]
    
    columns = analyzer.analyze_columns(data)
    
    assert len(columns) == 3
    
    # Check date column
    date_col = next(c for c in columns if c.name == "date")
    assert date_col.is_temporal
    
    # Check numeric column
    value_col = next(c for c in columns if c.name == "value")
    assert value_col.is_numeric
    
    # Check categorical column
    cat_col = next(c for c in columns if c.name == "category")
    assert cat_col.is_categorical


def test_detect_data_type():
    """Test data type detection."""
    analyzer = DataAnalyzer()
    
    # Test time series data
    data = [
        {"date": "2023-01-01", "value": 100},
        {"date": "2023-01-02", "value": 200},
    ]
    columns = analyzer.analyze_columns(data)
    data_type = analyzer.detect_data_type(columns)
    assert data_type == DataType.TIME_SERIES
    
    # Test categorical data
    data = [
        {"category": "A", "value": 100},
        {"category": "B", "value": 200},
    ]
    columns = analyzer.analyze_columns(data)
    data_type = analyzer.detect_data_type(columns)
    assert data_type == DataType.CATEGORICAL


def test_suggest_chart_type():
    """Test chart type suggestion."""
    analyzer = DataAnalyzer()
    
    # Time series should suggest line chart
    data = [
        {"date": "2023-01-01", "value": 100},
        {"date": "2023-01-02", "value": 200},
    ]
    columns = analyzer.analyze_columns(data)
    data_type = analyzer.detect_data_type(columns)
    chart_type = analyzer.suggest_chart_type(data_type, columns)
    assert chart_type == ChartType.LINE
    
    # Categorical should suggest bar or pie
    data = [
        {"category": "A", "value": 100},
        {"category": "B", "value": 200},
    ]
    columns = analyzer.analyze_columns(data)
    data_type = analyzer.detect_data_type(columns)
    chart_type = analyzer.suggest_chart_type(data_type, columns)
    assert chart_type in [ChartType.BAR, ChartType.PIE]


def test_generate_filters():
    """Test filter generation."""
    analyzer = DataAnalyzer()
    
    data = [
        {"date": "2023-01-01", "value": 100, "category": "A"},
        {"date": "2023-01-02", "value": 200, "category": "B"},
    ]
    
    columns = analyzer.analyze_columns(data)
    filters = analyzer.generate_filters(columns)
    
    assert len(filters) > 0
    
    # Should have a date range filter
    date_filters = [f for f in filters if f.filter_type == "date_range"]
    assert len(date_filters) > 0
    
    # Should have a multi-select filter for category
    multi_select_filters = [f for f in filters if f.filter_type == "multi_select"]
    assert len(multi_select_filters) > 0


def test_analyze_dataset():
    """Test complete dataset analysis."""
    analyzer = DataAnalyzer()
    
    data = [
        {"date": "2023-01-01", "sales": 100, "region": "North"},
        {"date": "2023-01-02", "sales": 200, "region": "South"},
        {"date": "2023-01-03", "sales": 150, "region": "North"},
    ]
    
    config = analyzer.analyze_dataset(data)
    
    assert config.data_type == DataType.TIME_SERIES
    assert config.recommended_chart == ChartType.LINE
    assert config.x_axis is not None
    assert config.y_axis is not None
    assert len(config.filters) > 0
