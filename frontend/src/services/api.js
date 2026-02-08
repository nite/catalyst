import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const datasetService = {
  // Get all datasets
  async getDatasets() {
    const response = await apiClient.get('/datasets');
    return response.data;
  },

  // Get specific dataset metadata
  async getDataset(datasetId) {
    const response = await apiClient.get(`/datasets/${datasetId}`);
    return response.data;
  },

  // Fetch dataset data
  async getDatasetData(datasetId, options = {}) {
    const params = {
      aggregation_strategy: options.strategy || 'auto',
      max_rows: options.maxRows,
      limit: options.limit || 10000,
    };
    
    const response = await apiClient.get(`/datasets/${datasetId}/data`, { params });
    return response.data;
  },

  // Analyze dataset
  async analyzeDataset(datasetId, limit = 1000) {
    const response = await apiClient.post(`/datasets/${datasetId}/analyze`, null, {
      params: { limit }
    });
    return response.data;
  },

  // Aggregate dataset on server
  async aggregateDataset(datasetId, spec) {
    const response = await apiClient.post(`/datasets/${datasetId}/aggregate`, spec);
    return response.data;
  },
};

export default datasetService;
