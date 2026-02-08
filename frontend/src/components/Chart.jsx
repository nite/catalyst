import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Scatter, Chart as ReactChart } from 'react-chartjs-2'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'
import { useMemo } from 'react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TreemapController,
  TreemapElement
)

export default function Chart({ data, chartConfig, analysis }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const { chart_type, x_axis, y_axis, category, value } = chartConfig

    // Prepare data based on chart type
    if (chart_type === 'line' || chart_type === 'bar') {
      // For line and bar charts
      const labels = data.map(row => row[x_axis]).slice(0, 50)
      const values = data.map((row, index) => {
        const rawValue = row[y_axis]
        const numericValue = Number(rawValue)
        return Number.isFinite(numericValue) ? numericValue : index
      }).slice(0, 50)

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

    if (chart_type === 'treemap') {
      const palette = [
        '#14b8a6',
        '#06b6d4',
        '#3b82f6',
        '#6366f1',
        '#8b5cf6',
        '#ec4899',
        '#f97316',
        '#eab308',
        '#22c55e'
      ]

      return {
        datasets: [
          {
            tree: data,
            key: value,
            groups: [category],
            spacing: 1,
            borderColor: 'rgba(255, 255, 255, 0.9)',
            borderWidth: 1,
            backgroundColor: (ctx) => {
              const index = ctx?.dataIndex ?? 0
              return palette[index % palette.length]
            }
          }
        ]
      }
    }

    if (chart_type === 'map') {
      const aggregated = {}
      data.forEach(row => {
        const location = row[chartConfig.location]
        const val = parseFloat(row[chartConfig.value]) || 0
        if (location) {
          aggregated[location] = (aggregated[location] || 0) + val
        }
      })

      const labels = Object.keys(aggregated).slice(0, 20)
      const values = Object.values(aggregated).slice(0, 20)

      return {
        labels,
        datasets: [
          {
            label: chartConfig.value,
            data: values,
            borderColor: 'rgb(20, 184, 166)',
            backgroundColor: 'rgba(20, 184, 166, 0.6)',
            borderWidth: 2
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

  const isCompact = typeof window !== 'undefined' && window.innerWidth < 768
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
    scales: ['treemap', 'pie'].includes(chartConfig.chart_type) ? undefined : {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: isCompact ? 5 : 10
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function (value) {
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
    scatter: Scatter,
    treemap: ReactChart
  }[chartConfig.chart_type] || Bar

  return (
    <div className="w-full h-full" data-testid="chart-canvas">
      {chartConfig.chart_type === 'treemap' ? (
        <ChartComponent type="treemap" data={chartData} options={options} />
      ) : (
        <ChartComponent data={chartData} options={options} />
      )}
    </div>
  )
}
