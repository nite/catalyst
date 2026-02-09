import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { useMemo } from "react";
import { Bar, Line, Chart as ReactChart, Scatter } from "react-chartjs-2";

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
	TreemapElement,
);

export default function Chart({ data, chartConfig }) {
	const chartData = useMemo(() => {
		if (!data || data.length === 0) return null;

		const { chart_type, x_axis, y_axis, category, value, color_by } =
			chartConfig;
		
		const palette = [
			"#14b8a6",
			"#06b6d4",
			"#3b82f6",
			"#6366f1",
			"#8b5cf6",
			"#ec4899",
			"#f97316",
			"#eab308",
			"#22c55e",
		];

		// Check if data is pre-aggregated from DuckDB (has x_label, y_value fields)
		const isPreAggregated = data.length > 0 && 'x_label' in data[0] && 'y_value' in data[0];

		// For line/bar charts with pre-aggregated data from DuckDB
		if ((chart_type === "line" || chart_type === "bar") && isPreAggregated) {
			// Check if we have grouping (group_by field)
			const hasGrouping = data.length > 0 && 'group_by' in data[0];

			if (hasGrouping) {
				// Group data by group_by value
				const grouped = new Map();
				data.forEach(row => {
					const group = row.group_by ?? "Other";
					if (!grouped.has(group)) {
						grouped.set(group, []);
					}
					grouped.get(group).push(row);
				});

				// Extract unique labels (x_label values)
				const labels = [...new Set(data.map(row => row.x_label))].sort();

				// Create datasets for each group
				const datasets = Array.from(grouped.entries()).map(([group, rows], index) => {
					// Build data array matching labels
					const dataMap = new Map(rows.map(r => [r.x_label, r.y_value]));
					const yKey = Array.isArray(y_axis) ? y_axis[0] : y_axis;
					
					return {
						label: `${yKey} · ${group}`,
						data: labels.map(label => dataMap.get(label) ?? 0),
						borderColor: palette[index % palette.length],
						backgroundColor:
							chart_type === "bar"
								? `${palette[index % palette.length]}cc`
								: `${palette[index % palette.length]}22`,
						borderWidth: 2,
						fill: chart_type === "line",
						tension: 0.35,
					};
				});

				return { labels, datasets };
			} else {
				// No grouping - single dataset
				const labels = data.map(row => row.x_label);
				const values = data.map(row => row.y_value);
				const yKey = Array.isArray(y_axis) ? y_axis[0] : y_axis;

				return {
					labels,
					datasets: [{
						label: yKey,
						data: values,
						borderColor: palette[0],
						backgroundColor:
							chart_type === "bar"
								? `${palette[0]}cc`
								: `${palette[0]}22`,
						borderWidth: 2,
						fill: chart_type === "line",
						tension: 0.35,
					}]
				};
			}
		}

		// For scatter with pre-aggregated data (though scatter typically doesn't aggregate)
		if (chart_type === "scatter" && isPreAggregated) {
			const hasGrouping = data.length > 0 && 'group_by' in data[0];
			
			if (hasGrouping) {
				const grouped = new Map();
				data.forEach(row => {
					const group = row.group_by ?? "Other";
					if (!grouped.has(group)) {
						grouped.set(group, []);
					}
					grouped.get(group).push({ x: row.x_label, y: row.y_value });
				});

				return {
					datasets: Array.from(grouped.entries()).map(([group, points], index) => ({
						label: group,
						data: points,
						backgroundColor: `${palette[index % palette.length]}66`,
						borderColor: palette[index % palette.length],
						borderWidth: 1,
					})),
				};
			}

			return {
				datasets: [{
					label: 'Data',
					data: data.map(row => ({ x: row.x_label, y: row.y_value })),
					backgroundColor: `${palette[0]}66`,
					borderColor: palette[0],
					borderWidth: 1,
				}]
			};
		}

		// Fallback for raw data (treemap, map, or when DuckDB not used)
		// This handles legacy cases and chart types that don't use SQL aggregation

		const xAxisKeys = Array.isArray(x_axis)
			? x_axis.filter(Boolean)
			: x_axis
				? [x_axis]
				: [];
		const yAxisKeys = Array.isArray(y_axis)
			? y_axis.filter(Boolean)
			: y_axis
				? [y_axis]
				: [];
		const colorKeys = Array.isArray(color_by)
			? color_by.filter(Boolean)
			: color_by
				? [color_by]
				: [];
		const colorKey = colorKeys[0] || null;

		// For treemap (uses raw data)
		if (chart_type === "treemap") {
			return {
				datasets: [
					{
						tree: data,
						key: value,
						groups: [category],
						spacing: 1,
						borderColor: "rgba(255, 255, 255, 0.9)",
						borderWidth: 1,
						backgroundColor: (ctx) => {
							const index = ctx?.dataIndex ?? 0;
							return palette[index % palette.length];
						},
					},
				],
			};
		}

		// For map (uses raw data with manual aggregation)
		if (chart_type === "map") {
			const aggregated = {};
			data.forEach((row) => {
				const location = row[chartConfig.location];
				const val = parseFloat(row[chartConfig.value]) || 0;
				if (location) {
					aggregated[location] = (aggregated[location] || 0) + val;
				}
			});

			const labels = Object.keys(aggregated).slice(0, 20);
			const values = Object.values(aggregated).slice(0, 20);

			return {
				labels,
				datasets: [
					{
						label: chartConfig.value,
						data: values,
						borderColor: "rgb(20, 184, 166)",
						backgroundColor: "rgba(20, 184, 166, 0.6)",
						borderWidth: 2,
					},
				],
			};
		}

		// For scatter without aggregation (raw x/y data)
		if (chart_type === "scatter" && !isPreAggregated) {
			const xKey = xAxisKeys[0];
			if (!xKey || yAxisKeys.length === 0) return null;

			if (colorKey) {
				const yKey = yAxisKeys[0];
				const grouped = new Map();
				data.slice(0, 400).forEach((row) => {
					const group = row[colorKey] ?? "Other";
					const xVal = Number(row[xKey]);
					const yVal = Number(row[yKey]);
					if (!Number.isFinite(xVal) || !Number.isFinite(yVal)) return;
					if (!grouped.has(group)) {
						grouped.set(group, []);
					}
					grouped.get(group).push({ x: xVal, y: yVal });
				});

				return {
					datasets: Array.from(grouped.entries()).map(
						([group, points], index) => ({
							label: `${yKey} · ${group}`,
							data: points,
							backgroundColor: `${palette[index % palette.length]}66`,
							borderColor: palette[index % palette.length],
							borderWidth: 1,
						}),
					),
				};
			}

			return {
				datasets: yAxisKeys.map((yKey, index) => ({
					label: `${xKey} vs ${yKey}`,
					data: data.slice(0, 200).map((row) => ({
						x: Number(row[xKey]) || 0,
						y: Number(row[yKey]) || 0,
					})),
					backgroundColor: `${palette[index % palette.length]}66`,
					borderColor: palette[index % palette.length],
					borderWidth: 1,
				})),
			};
		}

		return null;
	}, [data, chartConfig]);

	const isCompact = typeof window !== "undefined" && window.innerWidth < 768;

	// Check if we have color grouping enabled
	const colorByArray = Array.isArray(chartConfig.color_by)
		? chartConfig.color_by.filter(Boolean)
		: chartConfig.color_by
			? [chartConfig.color_by]
			: [];
	const hasColorBy = colorByArray.length > 0;
	const isStacked = chartConfig.chart_type === "bar" && hasColorBy;

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
				labels: {
					usePointStyle: true,
					padding: 15,
				},
			},
			tooltip: {
				enabled: true,
				mode: "index",
				intersect: false,
			},
		},
		scales: ["treemap", "pie"].includes(chartConfig.chart_type)
			? undefined
			: {
					x: {
						stacked: isStacked,
						grid: {
							display: false,
						},
						ticks: {
							maxRotation: 45,
							minRotation: 0,
							autoSkip: true,
							maxTicksLimit: isCompact ? 5 : 10,
						},
					},
					y: {
						stacked: isStacked,
						grid: {
							color: "rgba(0, 0, 0, 0.05)",
						},
						ticks: {
							callback: (value) => {
								if (Math.abs(value) >= 1000000) {
									return `${(value / 1000000).toFixed(1)}M`;
								}
								if (Math.abs(value) >= 1000) {
									return `${(value / 1000).toFixed(1)}K`;
								}
								return value;
							},
						},
					},
				},
	};

	if (!chartData) {
		return (
			<div className="text-left py-8 text-gray-600">
				No data available for visualization
			</div>
		);
	}

	const ChartComponent =
		{
			line: Line,
			bar: Bar,
			scatter: Scatter,
			treemap: ReactChart,
		}[chartConfig.chart_type] || Bar;

	return (
		<div className="w-full h-full" data-testid="chart-canvas">
			{chartConfig.chart_type === "treemap" ? (
				<ChartComponent type="treemap" data={chartData} options={options} />
			) : (
				<ChartComponent data={chartData} options={options} />
			)}
		</div>
	);
}
