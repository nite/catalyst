import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiBarChart2 } from 'react-icons/fi'
import { useState } from 'react'

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <FiBarChart2 className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Catalyst</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') ? 'text-primary-600' : 'text-gray-700'
                } hover:text-primary-600 transition-colors font-medium`}
              >
                Home
              </Link>
              <Link
                to="/datasets"
                className={`${
                  isActive('/datasets') || location.pathname.startsWith('/datasets/')
                    ? 'text-primary-600'
                    : 'text-gray-700'
                } hover:text-primary-600 transition-colors font-medium`}
              >
                Explore Datasets
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${
                  isActive('/') ? 'text-primary-600' : 'text-gray-700'
                } hover:text-primary-600 font-medium`}
              >
                Home
              </Link>
              <Link
                to="/datasets"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${
                  isActive('/datasets') || location.pathname.startsWith('/datasets/')
                    ? 'text-primary-600'
                    : 'text-gray-700'
                } hover:text-primary-600 font-medium`}
              >
                Explore Datasets
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Catalyst - Mobile-first data visualization platform
          </p>
        </div>
      </footer>
    </div>
  )
}
