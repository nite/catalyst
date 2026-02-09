import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import { fetchDataset, fetchDatasetData, analyzeDataset, fetchDatasets } from '../utils/api'
import Chart from './Chart'
import DataFilters from './DataFilters'
import { useHeader } from './HeaderContext'

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
  const [chartType, setChartType] = useState('bar')
  const [xAxis, setXAxis] = useState('')
  const [yAxis, setYAxis] = useState('')
  const [categoryAxis, setCategoryAxis] = useState('')
  const [valueAxis, setValueAxis] = useState('')
  const [locationAxis, setLocationAxis] = useState('')
  const [columnSort, setColumnSort] = useState('default')
  const { setHeader } = useHeader()

  const loadDataset = useCallback(async () => {
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

      if (analysisData?.recommended_chart) {
        const recommended = analysisData.recommended_chart
        setChartType(recommended.chart_type || 'bar')
        setXAxis(recommended.x_axis || '')
        setYAxis(recommended.y_axis || '')
        setCategoryAxis(recommended.category || '')
        setValueAxis(recommended.value || '')
        setLocationAxis(recommended.location || '')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [datasetId])

  useEffect(() => {
    loadDataset()
  }, [loadDataset])

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

  const loadData = useCallback(async () => {
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
  }, [dataset, datasetId, filters])

  useEffect(() => {
    if (dataset) {
      loadData()
    }
  }, [dataset, loadData])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleChartTypeChange = useCallback((value) => {
    setChartType(value)
  }, [])

  const handleDatasetChange = useCallback((value) => {
    if (value && value !== datasetId) {
      navigate(`/datasets/${value}`)
    }
  }, [datasetId, navigate])

  const columns = analysis?.columns || []

  const columnData = useMemo(() => {
    const columns = analysis?.columns || []
    const sorter = (values) => {
      if (columnSort === 'asc') {
        return [...values].sort((a, b) => a.localeCompare(b))
      }
      if (columnSort === 'desc') {
        return [...values].sort((a, b) => b.localeCompare(a))
      }
      return values
    }

    return {
      allColumns: sorter(columns.map(col => col.name)),
      numericColumns: sorter(columns.filter(col => col.type === 'numerical').map(col => col.name)),
      categoricalColumns: sorter(columns.filter(col => col.type === 'categorical').map(col => col.name)),
      temporalColumns: sorter(columns.filter(col => col.type === 'temporal').map(col => col.name)),
      geographicColumns: sorter(columns.filter(col => col.is_geographic).map(col => col.name))
    }
  }, [analysis, columnSort])

  const {
    allColumns,
    numericColumns,
    categoricalColumns,
    temporalColumns,
    geographicColumns
  } = columnData

  useEffect(() => {
    if (!analysis?.columns || analysis.columns.length === 0) {
      return
    }

    setXAxis((prev) => prev || temporalColumns[0] || allColumns[0] || '')
    setYAxis((prev) => prev || numericColumns[0] || allColumns[0] || '')
    setCategoryAxis((prev) => prev || categoricalColumns[0] || allColumns[0] || '')
    setValueAxis((prev) => prev || numericColumns[0] || allColumns[0] || '')
    setLocationAxis((prev) => prev || geographicColumns[0] || categoricalColumns[0] || allColumns[0] || '')
  }, [analysis, allColumns, categoricalColumns, geographicColumns, numericColumns, temporalColumns])

  useEffect(() => {
    if (!analysis?.columns || analysis.columns.length === 0) {
      return
    }

    if (['line', 'bar'].includes(chartType)) {
      const preferredX = temporalColumns[0] || categoricalColumns[0] || allColumns[0] || ''
      const preferredY = numericColumns[0] || allColumns[0] || ''
      if (preferredX) {
        setXAxis(preferredX)
      }
      if (preferredY) {
        setYAxis(preferredY)
      }
      return
    }

    if (chartType === 'scatter') {
      const scatterX = numericColumns[0] || allColumns[0] || ''
      const scatterY = numericColumns[1] || numericColumns[0] || allColumns[0] || ''
      if (scatterX) {
        setXAxis(scatterX)
      }
      if (scatterY) {
        setYAxis(scatterY)
      }
    }
  }, [allColumns, analysis, categoricalColumns, chartType, numericColumns, temporalColumns])

  const selectedChart = useMemo(() => {
    if (!chartType) return null

    if (chartType === 'treemap') {
      if (!categoryAxis || !valueAxis) return null
      return {
        chart_type: 'treemap',
        title: `${valueAxis} by ${categoryAxis}`,
        category: categoryAxis,
        value: valueAxis
      }
    }

    if (chartType === 'map') {
      if (!locationAxis || !valueAxis) return null
      return {
        chart_type: 'map',
        title: `${valueAxis} by ${locationAxis}`,
        location: locationAxis,
        value: valueAxis
      }
    }

    if (!xAxis || !yAxis) return null
    return {
      chart_type: chartType,
      title: `${yAxis} by ${xAxis}`,
      x_axis: xAxis,
      y_axis: yAxis
    }
  }, [categoryAxis, chartType, locationAxis, valueAxis, xAxis, yAxis])

  const headerContent = useMemo(() => {
    if (!dataset) return null

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
        <Link
          to="/datasets"
          className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
        >
          <FiArrowLeft className="mr-1" />
          Back
        </Link>
        <span data-testid="dataset-title" className="text-xs font-semibold text-gray-900">
          {dataset.name}
        </span>
        <span className="text-xs text-gray-500">{dataset.description}</span>
        <span className="text-xs text-gray-500">{dataset.provider}</span>
        <span className="text-xs text-gray-500">{dataset.category}</span>
        <button
          type="button"
          onClick={loadDataset}
          className="text-xs px-2 py-1 border border-gray-200 rounded-full hover:bg-white"
        >
          <FiRefreshCw className="inline mr-1" />
          Refresh
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1 min-w-[150px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Dataset</span>
          <select
            data-testid="dataset-select"
            value={datasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="input-field-compact"
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
        <div className="flex items-center gap-1 min-w-[120px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Chart</span>
          <select
            data-testid="chart-type-select"
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            className="input-field-compact"
            disabled={columns.length === 0}
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="scatter">Scatter</option>
            <option value="treemap">Treemap</option>
            <option value="map">Map</option>
          </select>
        </div>
        <div className="flex items-center gap-1 min-w-[120px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Sort</span>
          <select
            value={columnSort}
            onChange={(e) => setColumnSort(e.target.value)}
            className="input-field-compact"
          >
            <option value="default">Default</option>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
        {['line', 'bar', 'scatter'].includes(chartType) && (
          <div className="flex items-center gap-1 min-w-[140px]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">X</span>
            <select
              data-testid="x-axis-select"
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="input-field-compact"
            >
              {allColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}
        {['line', 'bar', 'scatter'].includes(chartType) && (
          <div className="flex items-center gap-1 min-w-[140px]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Y</span>
            <select
              data-testid="y-axis-select"
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="input-field-compact"
            >
              {numericColumns.length === 0 && allColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
              {numericColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}
        {chartType === 'treemap' && (
          <>
            <div className="flex items-center gap-1 min-w-[150px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Category</span>
              <select
                data-testid="category-select"
                value={categoryAxis}
                onChange={(e) => setCategoryAxis(e.target.value)}
                className="input-field-compact"
              >
                {(categoricalColumns.length ? categoricalColumns : allColumns).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 min-w-[130px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Value</span>
              <select
                data-testid="value-select"
                value={valueAxis}
                onChange={(e) => setValueAxis(e.target.value)}
                className="input-field-compact"
              >
                {(numericColumns.length ? numericColumns : allColumns).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {chartType === 'map' && (
          <>
            <div className="flex items-center gap-1 min-w-[150px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Location</span>
              <select
                data-testid="location-select"
                value={locationAxis}
                onChange={(e) => setLocationAxis(e.target.value)}
                className="input-field-compact"
              >
                {(geographicColumns.length ? geographicColumns : allColumns).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 min-w-[130px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Value</span>
              <select
                data-testid="map-value-select"
                value={valueAxis}
                onChange={(e) => setValueAxis(e.target.value)}
                className="input-field-compact"
              >
                {(numericColumns.length ? numericColumns : allColumns).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        </div>
        {analysis?.statistics && (
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Total: {analysis.statistics.total_rows?.toLocaleString()}</span>
            <span>Cols: {analysis.statistics.total_columns}</span>
            <span>Time: {analysis.statistics.has_time_series ? 'Yes' : 'No'}</span>
            <span>Geo: {analysis.statistics.has_geographic ? 'Yes' : 'No'}</span>
          </div>
        )}
      </div>
    )
  }, [allColumns, analysis, categoricalColumns, chartType, columnSort, dataset, datasetId, datasets, geographicColumns, handleDatasetChange, handleChartTypeChange, loadDataset, locationAxis, numericColumns, valueAxis, xAxis, yAxis])

  useEffect(() => {
    setHeader(headerContent)
    return () => setHeader(null)
  }, [headerContent, setHeader])

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
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <section className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-2 flex-1 min-h-0 overflow-hidden">
        {/* Filters Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <DataFilters
            filters={analysis?.filters || []}
            currentFilters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Chart Area */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-auto">
          {/* Chart Display */}
          {data && selectedChart && (
            <div data-testid="chart-section" className="border-b border-gray-200 pb-2 flex-1 min-h-0 overflow-hidden">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                {selectedChart.title}
              </div>
              <div className="h-[260px] md:h-[320px] xl:h-[380px]">
                <Chart
                  data={data.data}
                  chartConfig={selectedChart}
                  analysis={analysis}
                />
              </div>
            </div>
          )}

          {/* Data Table Preview */}
          {data && data.data && data.data.length > 0 && (
            <div className="border-b border-gray-200 pb-2 max-h-[260px]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                <span>Data Preview</span>
                <span>{data.total} rows</span>
              </div>
              <div className="overflow-auto max-h-[220px]">
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
