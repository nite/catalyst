import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import FeedView from './pages/FeedView'
import AdminView from './pages/AdminView'
import AboutView from './pages/AboutView'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<FeedView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/about" element={<AboutView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
