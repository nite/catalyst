import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter } from 'react-icons/fi'
import { fetchDatasets } from '../utils/api'

export default function DatasetBrowser() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('provider') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    loadDatasets()
  }, [selectedProvider, selectedCategory])

  const loadDatasets = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (selectedProvider) params.provider = selectedProvider
      if (selectedCategory) params.category = selectedCategory
      
      const data = await fetchDatasets(params)
      setDatasets(data.datasets || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredDatasets = datasets.filter(ds =>
    ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const providers = ['data.gov', 'worldbank', 'owid', 'noaa', 'census']
  const categories = ['health', 'economy', 'climate', 'demographics', 'education', 'technology']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Datasets</h1>
          <p className="text-gray-600 mt-1">
            Browse {datasets.length} curated datasets from multiple sources
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-1" />
              Data Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="input-field"
            >
              <option value="">All Providers</option>
              {providers.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading datasets...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button onClick={loadDatasets} className="btn-primary mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Dataset Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map(dataset => (
              <Link
                key={dataset.id}
                to={`/datasets/${dataset.id}`}
                className="card hover:scale-105 transform transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {dataset.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {dataset.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {dataset.provider}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {dataset.category}
                  </span>
                  {dataset.has_time_series && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Time Series
                    </span>
                  )}
                  {dataset.has_geographic && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Geographic
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredDatasets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No datasets found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
