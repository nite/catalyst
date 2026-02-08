import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2'
import { useMemo } from 'react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Chart({ data, chartConfig, analysis }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const { chart_type, x_axis, y_axis, category, value } = chartConfig

    // Prepare data based on chart type
    if (chart_type === 'line' || chart_type === 'bar') {
      // For line and bar charts
      const labels = data.map(row => row[x_axis]).slice(0, 50)
      const values = data.map(row => row[y_axis]).slice(0, 50)

      return {
        labels,
        datasets: [
          {
            label: y_axis,
            data: values,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: chart_type === 'bar' 
              ? 'rgba(14, 165, 233, 0.8)' 
              : 'rgba(14, 165, 233, 0.1)',
            borderWidth: 2,
            fill: chart_type === 'line',
            tension: 0.4
          }
        ]
      }
    }

    if (chart_type === 'pie') {
      // For pie charts - aggregate by category
      const aggregated = {}
      data.forEach(row => {
        const cat = row[category]
        const val = parseFloat(row[value]) || 0
        aggregated[cat] = (aggregated[cat] || 0) + val
      })

      const labels = Object.keys(aggregated).slice(0, 10)
      const values = Object.values(aggregated).slice(0, 10)

      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              'rgba(14, 165, 233, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(99, 102, 241, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(34, 197, 94, 0.8)'
            ],
            borderWidth: 1
          }
        ]
      }
    }

    if (chart_type === 'scatter') {
      // For scatter plots
      const points = data.slice(0, 200).map(row => ({
        x: parseFloat(row[x_axis]) || 0,
        y: parseFloat(row[y_axis]) || 0
      }))

      return {
        datasets: [
          {
            label: `${x_axis} vs ${y_axis}`,
            data: points,
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
            borderColor: 'rgb(14, 165, 233)',
            borderWidth: 1
          }
        ]
      }
    }

    return null
  }, [data, chartConfig])

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth < 768 ? 1 : 2,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: chartConfig.chart_type === 'pie' ? undefined : {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 5 : 10
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            if (Math.abs(value) >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M'
            } else if (Math.abs(value) >= 1000) {
              return (value / 1000).toFixed(1) + 'K'
            }
            return value
          }
        }
      }
    }
  }

  if (!chartData) {
    return (
      <div className="text-center py-8 text-gray-600">
        No data available for visualization
      </div>
    )
  }

  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    scatter: Scatter
  }[chartConfig.chart_type] || Bar

  return (
    <div className="w-full" style={{ maxHeight: '500px' }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  )
}
