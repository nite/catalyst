import { useState, useEffect } from 'react'
import { FiSliders, FiX } from 'react-icons/fi'

export default function DataFilters({ filters, currentFilters, onChange }) {
  const [localFilters, setLocalFilters] = useState(currentFilters)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const handleFilterChange = (column, value) => {
    const newFilters = { ...localFilters, [column]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onChange(localFilters)
    setShowMobileFilters(false)
  }

  const resetFilters = () => {
    setLocalFilters({})
    onChange({})
  }

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
              type="date"
              value={localFilters[`${column}_from`] || ''}
              onChange={(e) => handleFilterChange(`${column}_from`, e.target.value)}
              className="input-field text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={localFilters[`${column}_to`] || ''}
              onChange={(e) => handleFilterChange(`${column}_to`, e.target.value)}
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
              type="number"
              value={localFilters[`${column}_min`] || min || ''}
              onChange={(e) => handleFilterChange(`${column}_min`, e.target.value)}
              placeholder={`Min: ${min || ''}`}
              className="input-field text-sm"
              step={step || 1}
            />
            <input
              type="number"
              value={localFilters[`${column}_max`] || max || ''}
              onChange={(e) => handleFilterChange(`${column}_max`, e.target.value)}
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
            value={localFilters[column] || ''}
            onChange={(e) => handleFilterChange(column, e.target.value)}
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
      <div className="bg-white rounded-lg shadow-md p-4">
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

      {/* Filter Panel */}
      <div
        className={`bg-white rounded-lg shadow-md p-4 ${
          showMobileFilters ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
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
