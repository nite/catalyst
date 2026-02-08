import { useState, useEffect } from 'react'
import { FiSliders, FiX } from 'react-icons/fi'

export default function DataFilters({ filters, currentFilters, onChange }) {
  const [localFilters, setLocalFilters] = useState(currentFilters)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const handleFilterChange = (column, value, applyNow = false) => {
    setLocalFilters((prev) => {
      const newFilters = { ...prev, [column]: value }
      if (applyNow) {
        onChange(newFilters)
      }
      return newFilters
    })
  }

  const applyFilters = () => {
    onChange(localFilters)
    setShowMobileFilters(false)
  }

  const resetFilters = () => {
    setLocalFilters({})
    onChange({})
  }

  const removeFilter = (key) => {
    setLocalFilters((prev) => {
      const updated = { ...prev }
      delete updated[key]
      onChange(updated)
      return updated
    })
  }

  const activeFilters = Object.entries(localFilters).filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })

  const renderFilter = (filter) => {
    const { column, filter_type, min, max, options, step } = filter

    if (filter_type === 'date_range') {
      return (
        <div key={column} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <div className="space-y-2">
            <input
              data-testid={`filter-${column}-from`}
              type="date"
              value={localFilters[`${column}_from`] || ''}
              onChange={(e) => handleFilterChange(`${column}_from`, e.target.value)}
              onBlur={(e) => handleFilterChange(`${column}_from`, e.target.value, true)}
              className="input-field text-sm"
              placeholder="From"
            />
            <input
              data-testid={`filter-${column}-to`}
              type="date"
              value={localFilters[`${column}_to`] || ''}
              onChange={(e) => handleFilterChange(`${column}_to`, e.target.value)}
              onBlur={(e) => handleFilterChange(`${column}_to`, e.target.value, true)}
              className="input-field text-sm"
              placeholder="To"
            />
          </div>
        </div>
      )
    }

    if (filter_type === 'range') {
      return (
        <div key={column} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <div className="space-y-2">
            <input
              data-testid={`filter-${column}-min`}
              type="number"
              value={localFilters[`${column}_min`] || min || ''}
              onChange={(e) => handleFilterChange(`${column}_min`, e.target.value)}
              onBlur={(e) => handleFilterChange(`${column}_min`, e.target.value, true)}
              placeholder={`Min: ${min || ''}`}
              className="input-field text-sm"
              step={step || 1}
            />
            <input
              data-testid={`filter-${column}-max`}
              type="number"
              value={localFilters[`${column}_max`] || max || ''}
              onChange={(e) => handleFilterChange(`${column}_max`, e.target.value)}
              onBlur={(e) => handleFilterChange(`${column}_max`, e.target.value, true)}
              placeholder={`Max: ${max || ''}`}
              className="input-field text-sm"
              step={step || 1}
            />
          </div>
        </div>
      )
    }

    if (filter_type === 'multi_select' && options && options.length > 0) {
      return (
        <div key={column} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <select
            data-testid={`filter-${column}-select`}
            value={localFilters[column] || ''}
            onChange={(e) => handleFilterChange(column, e.target.value, true)}
            className="input-field text-sm"
          >
            <option value="">All</option>
            {options.slice(0, 20).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return null
  }

  if (!filters || filters.length === 0) {
    return (
      <div className="bg-white/85 rounded-2xl shadow-[0_20px_60px_-45px_rgba(15,118,110,0.5)] p-4 border border-white/70">
        <p className="text-sm text-gray-600">No filters available</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden w-full btn-primary mb-4 flex items-center justify-center"
      >
        <FiSliders className="mr-2" />
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showMobileFilters && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Filter Panel */}
      <div
        data-testid="filters-panel"
        className={`bg-white/95 rounded-2xl shadow-[0_25px_70px_-50px_rgba(15,118,110,0.7)] p-4 border border-white/70 ${
          showMobileFilters
            ? 'fixed z-50 left-4 right-4 top-24 max-h-[70vh] overflow-y-auto'
            : 'hidden lg:block'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 font-display flex items-center">
            <FiSliders className="mr-2" />
            Filters
          </h3>
          {showMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => removeFilter(key)}
                className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
              >
                {key.replace(/_/g, ' ')}: {String(value)}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {filters.map(filter => renderFilter(filter))}
        </div>

        <div className="space-y-2 mt-6">
          <button
            onClick={applyFilters}
            className="w-full btn-primary"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="w-full btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  )
}
