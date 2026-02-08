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
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="rounded-[28px] bg-white/85 border border-white/70 shadow-[0_30px_80px_-60px_rgba(15,118,110,0.7)] px-6 py-10 md:px-12 md:py-14 animate-rise">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="uppercase tracking-[0.25em] text-xs text-primary-600 font-semibold">Insight Studio</p>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 font-display leading-tight">
              Explore data like a
              <span className="text-primary-600"> product</span>, not a report.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Catalyst is a mobile-first analytics studio for open data. Build stories from curated datasets, swipe through insights, and share confident answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/datasets" className="btn-primary text-lg px-8 py-3">
                Explore Datasets
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-3">
                See the workflow
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 animate-rise-delayed">
            {[
              { label: 'Datasets', value: '15+', hint: 'curated sources' },
              { label: 'Charts', value: '6', hint: 'adaptive types' },
              { label: 'Filters', value: 'Auto', hint: 'context aware' },
              { label: 'Devices', value: 'Every', hint: 'mobile ready' }
            ].map((stat) => (
              <div key={stat.label} className="card">
                <p className="text-sm text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 font-display mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Answer',
            description: 'Start with a KPI snapshot and the strongest trend.'
          },
          {
            title: 'Explore',
            description: 'Swap charts and filters without losing context.'
          },
          {
            title: 'Share',
            description: 'Send a single view that stays current.'
          }
        ].map((step, index) => (
          <div key={step.title} className="card animate-fade" style={{ animationDelay: `${index * 80}ms` }}>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-600">{step.title}</p>
            <p className="text-lg font-semibold text-gray-900 font-display mt-2">{step.description}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card animate-fade"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="text-primary-600 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-display mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Dataset Categories */}
      <section className="bg-white/90 rounded-[24px] shadow-[0_30px_80px_-60px_rgba(15,118,110,0.5)] p-8 border border-white/70">
        <h2 className="text-3xl font-bold text-gray-900 font-display mb-6">
          Available Data Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['Health', 'Economy', 'Climate', 'Demographics', 'Education'].map((category) => (
            <Link
              key={category}
              to={`/datasets?category=${category.toLowerCase()}`}
              className="p-4 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50/60 transition-all text-center font-medium"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 font-display">
          Trusted Data Sources
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {['data.gov', 'World Bank', 'Our World in Data', 'NOAA', 'US Census'].map((source) => (
            <div key={source} className="p-4 bg-white/90 rounded-xl shadow-sm border border-white/60">
              <p className="font-medium text-gray-700">{source}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
