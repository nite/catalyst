import React from 'react';
import ReactECharts from 'echarts-for-react';

function ChartRenderer({ data, config, height = 400 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  const getChartOption = () => {
    const { recommended_chart, x_axis, y_axis, group_by } = config;

    // Base configuration for mobile-friendly charts
    const baseOption = {
      tooltip: {
        trigger: 'axis',
        confine: true,
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save' },
          dataZoom: { title: { zoom: 'Zoom', back: 'Reset' } },
        },
        right: 20,
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
    };

    switch (recommended_chart) {
      case 'line':
        return getLineChartOption(data, x_axis, y_axis, baseOption);
      case 'bar':
        return getBarChartOption(data, x_axis, y_axis, baseOption);
      case 'pie':
        return getPieChartOption(data, x_axis, y_axis, baseOption);
      case 'scatter':
        return getScatterChartOption(data, x_axis, y_axis, baseOption);
      default:
        return getBarChartOption(data, x_axis, y_axis, baseOption);
    }
  };

  return (
    <div className="w-full">
      <ReactECharts
        option={getChartOption()}
        style={{ height: `${height}px`, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        lazyUpdate={true}
      />
    </div>
  );
}

function getLineChartOption(data, xAxis, yAxis, baseOption) {
  const xData = data.map(row => row[xAxis]);
  const yData = data.map(row => parseFloat(row[yAxis]) || 0);

  return {
    ...baseOption,
    title: {
      text: 'Time Series',
      left: 'center',
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        rotate: 45,
        interval: Math.floor(xData.length / 10),
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: yData,
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 2,
        },
      },
    ],
  };
}

function getBarChartOption(data, xAxis, yAxis, baseOption) {
  // Aggregate data by x-axis if needed
  const aggregated = {};
  data.forEach(row => {
    const key = row[xAxis];
    const value = parseFloat(row[yAxis]) || 0;
    aggregated[key] = (aggregated[key] || 0) + value;
  });

  const xData = Object.keys(aggregated).slice(0, 20); // Limit to 20 categories
  const yData = xData.map(key => aggregated[key]);

  return {
    ...baseOption,
    title: {
      text: 'Bar Chart',
      left: 'center',
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: yData,
        type: 'bar',
        itemStyle: {
          color: '#3b82f6',
        },
      },
    ],
  };
}

function getPieChartOption(data, xAxis, yAxis, baseOption) {
  // Aggregate data
  const aggregated = {};
  data.forEach(row => {
    const key = row[xAxis];
    const value = parseFloat(row[yAxis]) || 0;
    aggregated[key] = (aggregated[key] || 0) + value;
  });

  const pieData = Object.entries(aggregated)
    .slice(0, 10) // Limit to 10 categories
    .map(([name, value]) => ({ name, value }));

  return {
    ...baseOption,
    title: {
      text: 'Distribution',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      type: 'scroll',
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
}

function getScatterChartOption(data, xAxis, yAxis, baseOption) {
  const scatterData = data
    .filter(row => row[xAxis] != null && row[yAxis] != null)
    .map(row => [parseFloat(row[xAxis]) || 0, parseFloat(row[yAxis]) || 0])
    .slice(0, 5000); // Limit points for performance

  return {
    ...baseOption,
    title: {
      text: 'Scatter Plot',
      left: 'center',
    },
    xAxis: {
      type: 'value',
      name: xAxis,
    },
    yAxis: {
      type: 'value',
      name: yAxis,
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize: 6,
        itemStyle: {
          color: '#3b82f6',
          opacity: 0.6,
        },
      },
    ],
  };
}

export default ChartRenderer;
