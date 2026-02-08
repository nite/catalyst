import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { datasetService } from '../services/api';
import { cacheDataset, getCachedDataset } from '../services/cache';
import { initDuckDB, loadDataIntoTable, filterData } from '../services/duckdb';
import ChartRenderer from './ChartRenderer';
import DataFilters from './DataFilters';

function DatasetVisualization() {
  const { datasetId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [dataResponse, setDataResponse] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duckdbReady, setDuckdbReady] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    loadData();
  }, [datasetId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load dataset metadata
      const meta = await datasetService.getDataset(datasetId);
      setDataset(meta);

      // Check cache first
      let cached = await getCachedDataset(datasetId);
      
      let data;
      if (cached) {
        console.log('Using cached data');
        data = cached;
      } else {
        // Fetch fresh data
        data = await datasetService.getDatasetData(datasetId);
        
        // Cache for future use
        await cacheDataset(datasetId, data);
      }
      
      setDataResponse(data);

      // Load visualization config
      const viz = await datasetService.analyzeDataset(datasetId);
      setVisualization(viz);

      // Initialize DuckDB for client-side processing if strategy is client
      if (data.suggested_strategy === 'client') {
        try {
          await initDuckDB();
          await loadDataIntoTable(datasetId, data.data);
          setDuckdbReady(true);
          setFilteredData(data.data);
        } catch (err) {
          console.error('DuckDB initialization failed:', err);
          // Fall back to using data as-is
          setFilteredData(data.data);
        }
      } else {
        // Server-side strategy - use data as-is
        setFilteredData(data.data);
      }

    } catch (err) {
      setError('Failed to load dataset. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterChange(filters) {
    setActiveFilters(filters);

    if (!dataResponse) return;

    if (dataResponse.suggested_strategy === 'client' && duckdbReady) {
      // Client-side filtering with DuckDB
      try {
        const filtered = await filterData(datasetId, filters);
        setFilteredData(filtered);
      } catch (err) {
        console.error('Filter failed:', err);
      }
    } else {
      // Server-side filtering
      // For now, just filter in memory
      // In production, you'd make a server call
      let filtered = dataResponse.data;
      
      for (const [column, value] of Object.entries(filters)) {
        if (value === null || value === undefined) continue;
        
        if (Array.isArray(value) && value.length > 0) {
          filtered = filtered.filter(row => value.includes(row[column]));
        } else if (typeof value === 'object' && value.min !== undefined) {
          filtered = filtered.filter(row => {
            const val = parseFloat(row[column]);
            return (!value.min || val >= value.min) && (!value.max || val <= value.max);
          });
        }
      }
      
      setFilteredData(filtered);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">Loading dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
        <Link to="/" className="block mt-4 text-primary-600 hover:underline">
          ← Back to datasets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to datasets
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {dataset?.name}
            </h2>
            <p className="text-gray-600">{dataset?.description}</p>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            dataResponse?.suggested_strategy === 'client'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {dataResponse?.suggested_strategy === 'client' ? 'Client-side' : 'Server-side'}
          </span>
        </div>

        {/* Data stats */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Total rows:</span>{' '}
            {dataResponse?.total_rows.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Displayed:</span>{' '}
            {filteredData?.length.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Size:</span>{' '}
            {(dataResponse?.data_size_bytes / 1024).toFixed(1)} KB
          </div>
          {duckdbReady && (
            <div className="text-green-600 font-semibold">
              ⚡ DuckDB Active
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {visualization && (
        <DataFilters
          filters={visualization.filters}
          data={dataResponse?.data}
          onChange={handleFilterChange}
        />
      )}

      {/* Chart */}
      {visualization && filteredData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ChartRenderer
            data={filteredData}
            config={visualization}
            height={500}
          />
        </div>
      )}

      {/* Data preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {dataResponse?.columns.slice(0, 5).map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData?.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {dataResponse?.columns.slice(0, 5).map(col => (
                    <td key={col} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {String(row[col] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DatasetVisualization;
