import React, { useState, useEffect } from 'react';

function DataFilters({ filters, data, onChange }) {
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    // Initialize filter values
    const initial = {};
    filters.forEach(filter => {
      if (filter.filter_type === 'numeric_range') {
        initial[filter.column] = { min: null, max: null };
      } else if (filter.filter_type === 'multi_select') {
        initial[filter.column] = [];
      } else {
        initial[filter.column] = null;
      }
    });
    setFilterValues(initial);
  }, [filters]);

  const handleFilterChange = (column, value) => {
    const newFilters = { ...filterValues, [column]: value };
    setFilterValues(newFilters);
    
    // Only pass non-empty filters
    const activeFilters = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        if (Array.isArray(val) && val.length > 0) {
          activeFilters[key] = val;
        } else if (typeof val === 'object' && (val.min !== null || val.max !== null)) {
          activeFilters[key] = val;
        } else if (!Array.isArray(val) && typeof val !== 'object') {
          activeFilters[key] = val;
        }
      }
    });
    
    onChange(activeFilters);
  };

  const getUniqueValues = (column) => {
    if (!data) return [];
    const values = [...new Set(data.map(row => row[column]).filter(v => v != null))];
    return values.slice(0, 50); // Limit to 50 options
  };

  const getNumericRange = (column) => {
    if (!data) return { min: 0, max: 100 };
    const values = data
      .map(row => parseFloat(row[column]))
      .filter(v => !isNaN(v));
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map(filter => (
          <div key={filter.column} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.column}
            </label>
            
            {filter.filter_type === 'numeric_range' && (
              <NumericRangeFilter
                column={filter.column}
                range={getNumericRange(filter.column)}
                value={filterValues[filter.column]}
                onChange={(val) => handleFilterChange(filter.column, val)}
              />
            )}
            
            {filter.filter_type === 'multi_select' && (
              <MultiSelectFilter
                column={filter.column}
                options={getUniqueValues(filter.column)}
                value={filterValues[filter.column]}
                onChange={(val) => handleFilterChange(filter.column, val)}
              />
            )}
            
            {filter.filter_type === 'date_range' && (
              <DateRangeFilter
                column={filter.column}
                value={filterValues[filter.column]}
                onChange={(val) => handleFilterChange(filter.column, val)}
              />
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={() => {
          const reset = {};
          filters.forEach(f => {
            if (f.filter_type === 'numeric_range') {
              reset[f.column] = { min: null, max: null };
            } else if (f.filter_type === 'multi_select') {
              reset[f.column] = [];
            } else {
              reset[f.column] = null;
            }
          });
          setFilterValues(reset);
          onChange({});
        }}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}

function NumericRangeFilter({ column, range, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={value?.min || ''}
          onChange={(e) => onChange({ ...value, min: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          min={range.min}
          max={range.max}
        />
        <input
          type="number"
          placeholder="Max"
          value={value?.max || ''}
          onChange={(e) => onChange({ ...value, max: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          min={range.min}
          max={range.max}
        />
      </div>
      <div className="text-xs text-gray-500">
        Range: {range.min.toFixed(0)} - {range.max.toFixed(0)}
      </div>
    </div>
  );
}

function MultiSelectFilter({ column, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white"
      >
        {value?.length > 0 ? `${value.length} selected` : 'Select...'}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value?.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...(value || []), option]);
                  } else {
                    onChange((value || []).filter(v => v !== option));
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">{String(option)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRangeFilter({ column, value, onChange }) {
  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={value?.min || ''}
        onChange={(e) => onChange({ ...value, min: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <input
        type="date"
        value={value?.max || ''}
        onChange={(e) => onChange({ ...value, max: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
    </div>
  );
}

export default DataFilters;
