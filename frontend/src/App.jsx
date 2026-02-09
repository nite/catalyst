import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8011/api/datasets')
      .then(response => response.json())
      .then(data => {
        setDatasets(data.datasets || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Catalyst</h1>
        <p>Mobile-first Data Visualization Dashboard</p>
        <p className="port-info">Frontend running on port 3011</p>
      </header>
      
      <main className="content">
        <h2>Available Datasets</h2>
        {loading && <p>Loading datasets...</p>}
        {error && <p className="error">Error: {error}</p>}
        {!loading && !error && (
          <div className="datasets">
            {datasets.map(dataset => (
              <div key={dataset.id} className="dataset-card">
                <h3>{dataset.name}</h3>
                <p>{dataset.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>Backend API: http://localhost:8011</p>
      </footer>
    </div>
  )
}

export default App
