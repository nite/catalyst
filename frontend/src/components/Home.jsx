import { Link } from 'react-router-dom'
import { FiDatabase, FiBarChart2, FiFilter, FiSmartphone } from 'react-icons/fi'

export default function Home() {
  const features = [
    {
      icon: <FiDatabase className="h-8 w-8" />,
      title: 'Multiple Data Sources',
      description: 'Access 15+ curated datasets from data.gov, World Bank, Our World in Data, NOAA, and US Census'
    },
    {
      icon: <FiBarChart2 className="h-8 w-8" />,
      title: 'Smart Visualizations',
      description: 'Automatically configured charts based on data types - line charts, bar charts, pie charts, and more'
    },
    {
      icon: <FiFilter className="h-8 w-8" />,
      title: 'Interactive Filters',
      description: 'Filter data by date ranges, categories, and numeric values with intuitive controls'
    },
    {
      icon: <FiSmartphone className="h-8 w-8" />,
      title: 'Mobile-First Design',
      description: 'Responsive interface that works seamlessly on phones, tablets, and desktops'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Explore Data. <span className="text-primary-600">Anywhere.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A mobile-first platform for browsing and visualizing open datasets with automatically configured charts and filters
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/datasets" className="btn-primary text-lg px-8 py-3">
            Explore Datasets
          </Link>
          <a 
            href="#features" 
            className="btn-secondary text-lg px-8 py-3"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
        {features.map((feature, index) => (
          <div key={index} className="card">
            <div className="text-primary-600 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Dataset Categories */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Available Data Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['Health', 'Economy', 'Climate', 'Demographics', 'Education'].map((category) => (
            <Link
              key={category}
              to={`/datasets?category=${category.toLowerCase()}`}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center font-medium"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Trusted Data Sources
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {['data.gov', 'World Bank', 'Our World in Data', 'NOAA', 'US Census'].map((source) => (
            <div key={source} className="p-4 bg-white rounded-lg shadow-sm">
              <p className="font-medium text-gray-700">{source}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
