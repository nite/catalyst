import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error);
		throw error.response?.data?.detail || error.message || "An error occurred";
	},
);

export const fetchDatasets = async (params = {}) => {
	const response = await api.get("/datasets", { params });
	return response.data;
};

export const fetchDataset = async (datasetId) => {
	const response = await api.get(`/datasets/${datasetId}`);
	return response.data;
};

export const fetchDatasetData = async (datasetId, params = {}) => {
	const response = await api.get(`/datasets/${datasetId}/data`, { params });
	return response.data;
};

export const analyzeDataset = async (datasetId, sampleSize = 1000) => {
	const response = await api.post(`/datasets/${datasetId}/analyze`, null, {
		params: { sample_size: sampleSize },
	});
	return response.data;
};

export default api;
