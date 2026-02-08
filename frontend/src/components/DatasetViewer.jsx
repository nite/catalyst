import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import { fetchDataset, fetchDatasetData, analyzeDataset } from '../utils/api'
import Chart from './Chart'
import DataFilters from './DataFilters'

export default function DatasetViewer() {
  const { datasetId } = useParams()
  const [dataset, setDataset] = useState(null)
  const [data, setData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedChart, setSelectedChart] = useState(null)

  useEffect(() => {
    loadDataset()
  }, [datasetId])

  useEffect(() => {
    if (dataset) {
      loadData()
    }
  }, [dataset, filters])

  const loadDataset = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dataset metadata
      const datasetInfo = await fetchDataset(datasetId)
      setDataset(datasetInfo)
      
      // Analyze dataset to get chart recommendations
      const analysisData = await analyzeDataset(datasetId)
      setAnalysis(analysisData)
      
      // Select first recommended chart
      if (analysisData.chart_suggestions && analysisData.chart_suggestions.length > 0) {
        setSelectedChart(analysisData.chart_suggestions[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Fetch actual data with current filters
      const params = { limit: 500, ...filters }
      const dataResponse = await fetchDatasetData(datasetId, params)
      setData(dataResponse)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleChartChange = (chart) => {
    setSelectedChart(chart)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading dataset...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/datasets" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <FiArrowLeft className="mr-2" />
          Back to Datasets
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button onClick={loadDataset} className="btn-primary mt-2">
            <FiRefreshCw className="inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/datasets" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Datasets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{dataset?.name}</h1>
        <p className="text-gray-600 mt-2">{dataset?.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
            {dataset?.provider}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
            {dataset?.category}
          </span>
        </div>
      </div>

      {/* Dataset Statistics */}
      {analysis?.statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Rows</p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.statistics.total_rows?.toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Columns</p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.statistics.total_columns}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Time Series</p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.statistics.has_time_series ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Geographic</p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.statistics.has_geographic ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DataFilters
            filters={analysis?.filters || []}
            currentFilters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chart Type Selector */}
          {analysis?.chart_suggestions && analysis.chart_suggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Visualization Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.chart_suggestions.map((chart, index) => (
                  <button
                    key={index}
                    onClick={() => handleChartChange(chart)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedChart === chart
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {chart.chart_type.charAt(0).toUpperCase() + chart.chart_type.slice(1)} Chart
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chart Display */}
          {data && selectedChart && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedChart.title}
              </h3>
              <Chart
                data={data.data}
                chartConfig={selectedChart}
                analysis={analysis}
              />
            </div>
          )}

          {/* Data Table Preview */}
          {data && data.data && data.data.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Data Preview ({data.total} rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data.data[0]).slice(0, 6).map(key => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).slice(0, 6).map((value, i) => (
                          <td key={i} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
