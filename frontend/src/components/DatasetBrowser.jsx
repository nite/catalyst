import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { datasetService } from '../services/api';

function DatasetBrowser() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setLoading(true);
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      setError('Failed to load datasets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Get unique categories
  const categories = ['all', ...new Set(datasets.map(d => d.category))];

  // Filter datasets
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Explore Datasets
        </h2>
        <p className="text-gray-600">
          Browse {datasets.length} curated datasets from multiple providers
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search datasets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map(dataset => (
          <Link
            key={dataset.id}
            to={`/dataset/${dataset.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                {dataset.category}
              </span>
              <span className="text-xs text-gray-500">{dataset.provider}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {dataset.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {dataset.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {dataset.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            {dataset.size_estimate && (
              <div className="mt-4 text-xs text-gray-500">
                ~{dataset.size_estimate.toLocaleString()} rows
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No datasets found matching your criteria
        </div>
      )}
    </div>
  );
}

export default DatasetBrowser;
