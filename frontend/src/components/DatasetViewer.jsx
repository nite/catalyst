import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import { fetchDataset, fetchDatasetData, analyzeDataset, fetchDatasets } from '../utils/api'
import Chart from './Chart'
import DataFilters from './DataFilters'

export default function DatasetViewer() {
  const { datasetId } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState(null)
  const [datasets, setDatasets] = useState([])
  const [data, setData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedChartIndex, setSelectedChartIndex] = useState(0)

  useEffect(() => {
    loadDataset()
  }, [datasetId])

  useEffect(() => {
    const loadDatasetList = async () => {
      try {
        const response = await fetchDatasets()
        setDatasets(response.datasets || [])
      } catch (err) {
        console.error('Error loading dataset list:', err)
      }
    }

    loadDatasetList()
  }, [])

  useEffect(() => {
    if (dataset) {
      loadData()
    }
  }, [dataset, filters])

  const loadDataset = async () => {
    try {
      setLoading(true)
      setError(null)
      setFilters({})

      // Fetch dataset metadata
      const datasetInfo = await fetchDataset(datasetId)
      setDataset(datasetInfo)

      // Analyze dataset to get chart recommendations
      const analysisData = await analyzeDataset(datasetId)
      setAnalysis(analysisData)

      setSelectedChartIndex(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const params = { limit: 500 }
      const filterPayload = {}

      Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return
        }

        if (dataset?.date_column && key === `${dataset.date_column}_from`) {
          params.date_from = value
          return
        }

        if (dataset?.date_column && key === `${dataset.date_column}_to`) {
          params.date_to = value
          return
        }

        filterPayload[key] = value
      })

      if (Object.keys(filterPayload).length > 0) {
        params.filters = JSON.stringify(filterPayload)
      }

      const dataResponse = await fetchDatasetData(datasetId, params)
      setData(dataResponse)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleChartChange = (value) => {
    setSelectedChartIndex(Number(value))
  }

  const handleDatasetChange = (value) => {
    if (value && value !== datasetId) {
      navigate(`/datasets/${value}`)
    }
  }

  const chartOptions = analysis?.chart_suggestions || []
  const selectedChart = chartOptions[selectedChartIndex]

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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white/90 rounded-[28px] border border-white/70 shadow-[0_30px_80px_-60px_rgba(15,118,110,0.65)] p-6 animate-rise">
        <div className="flex flex-col gap-4">
          <Link to="/datasets" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <FiArrowLeft className="mr-2" />
            Back to Datasets
          </Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">
                {dataset?.name}
              </h1>
              <p className="text-gray-600 max-w-2xl">{dataset?.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  {dataset?.provider}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {dataset?.category}
                </span>
                <button
                  type="button"
                  onClick={loadDataset}
                  className="px-3 py-1 bg-white/80 text-gray-700 text-sm rounded-full border border-gray-200 hover:bg-white transition"
                >
                  <FiRefreshCw className="inline mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-[420px]">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Dataset
                </label>
                <select
                  data-testid="dataset-select"
                  value={datasetId}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="input-field text-sm"
                >
                  {datasets.length === 0 && dataset?.name && (
                    <option value={datasetId}>{dataset.name}</option>
                  )}
                  {datasets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Chart
                </label>
                <select
                  data-testid="chart-select"
                  value={selectedChartIndex}
                  onChange={(e) => handleChartChange(e.target.value)}
                  className="input-field text-sm"
                  disabled={chartOptions.length === 0}
                >
                  {chartOptions.map((chart, index) => (
                    <option key={`${chart.chart_type}-${index}`} value={index}>
                      {chart.title || `${chart.chart_type} chart`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Statistics */}
        {analysis?.statistics && (
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-4 min-w-[640px] md:min-w-0 md:grid md:grid-cols-4">
              <div className="card">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900 font-display mt-2">
                  {analysis.statistics.total_rows?.toLocaleString()}
                </p>
              </div>
              <div className="card">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Columns</p>
                <p className="text-2xl font-bold text-gray-900 font-display mt-2">
                  {analysis.statistics.total_columns}
                </p>
              </div>
              <div className="card">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Time Series</p>
                <p className="text-2xl font-bold text-gray-900 font-display mt-2">
                  {analysis.statistics.has_time_series ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="card">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Geographic</p>
                <p className="text-2xl font-bold text-gray-900 font-display mt-2">
                  {analysis.statistics.has_geographic ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Filters Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <DataFilters
            filters={analysis?.filters || []}
            currentFilters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Chart Area */}
        <div className="space-y-6">
          {/* Chart Display */}
          {data && selectedChart && (
            <div className="bg-white/90 rounded-[24px] shadow-[0_30px_80px_-60px_rgba(15,118,110,0.6)] p-6 border border-white/70 animate-fade">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 font-display">
                  {selectedChart.title}
                </h3>
              </div>
              <Chart
                data={data.data}
                chartConfig={selectedChart}
                analysis={analysis}
              />
            </div>
          )}

          {/* Data Table Preview */}
          {data && data.data && data.data.length > 0 && (
            <div className="bg-white/90 rounded-[24px] shadow-[0_30px_80px_-60px_rgba(15,118,110,0.5)] p-6 border border-white/70 animate-fade">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 font-display">
                  Data Preview
                </h3>
                <p className="text-sm text-gray-500">{data.total} rows</p>
              </div>
              <div className="overflow-auto max-h-[320px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(data.data[0]).slice(0, 6).map(key => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
      </section>
    </div>
  )
}
