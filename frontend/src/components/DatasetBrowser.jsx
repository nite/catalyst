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
  const activeFiltersCount = [searchTerm, selectedProvider, selectedCategory].filter(Boolean).length

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="uppercase tracking-[0.35em] text-xs text-primary-600 font-semibold">
          Dataset Library
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 data-testid="datasets-title" className="text-3xl md:text-4xl font-bold text-gray-900 font-display">
              Explore Datasets
            </h1>
            <p className="text-gray-600">
              Browse {datasets.length} curated datasets across trusted sources.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="px-3 py-1 bg-white/70 rounded-full border border-white/80">
              Results: {filteredDatasets.length}
            </span>
            <span className="px-3 py-1 bg-white/70 rounded-full border border-white/80">
              Filters: {activeFiltersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/85 rounded-2xl shadow-[0_25px_70px_-55px_rgba(15,118,110,0.6)] p-4 md:p-6 space-y-4 border border-white/70">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            data-testid="dataset-search"
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/70 text-gray-600 hover:bg-primary-100'
                }`}
            >
              {category}
            </button>
          ))}
          {providers.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${selectedProvider === provider
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/70 text-gray-600 hover:bg-primary-100'
                }`}
            >
              {provider}
            </button>
          ))}
          {(selectedProvider || selectedCategory || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedProvider('')
                setSelectedCategory('')
                setSearchTerm('')
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-900 text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-1" />
              Data Provider
            </label>
            <select
              data-testid="provider-select"
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
              data-testid="category-select"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset, index) => (
              <Link
                key={dataset.id}
                to={`/datasets/${dataset.id}`}
                data-testid="dataset-card"
                className="card group hover:-translate-y-1 transition-transform animate-fade"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 font-display line-clamp-2">
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
