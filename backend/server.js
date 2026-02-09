require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8011;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Catalyst backend is running' });
});

// API routes
app.get('/api/datasets', (req, res) => {
  res.json({
    datasets: [
      { id: 1, name: 'Sample Dataset 1', description: 'Example dataset for visualization' },
      { id: 2, name: 'Sample Dataset 2', description: 'Another example dataset' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Catalyst backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api/datasets`);
});
