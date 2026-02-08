import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import DatasetBrowser from './components/DatasetBrowser'
import DatasetViewer from './components/DatasetViewer'
import { HeaderProvider } from './components/HeaderContext'

function App() {
  return (
    <Router>
      <HeaderProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/datasets" element={<DatasetBrowser />} />
            <Route path="/datasets/:datasetId" element={<DatasetViewer />} />
          </Routes>
        </Layout>
      </HeaderProvider>
    </Router>
  )
}

export default App
