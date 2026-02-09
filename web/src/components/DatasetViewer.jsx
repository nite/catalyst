import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	analyzeDataset,
	fetchDataset,
	fetchDatasetData,
	fetchDatasets,
} from "../utils/api";
import {
	initDuckDB,
	loadJSONData,
	query as duckQuery,
} from "../utils/duckdb";
import Chart from "./Chart";
import DataFilters from "./DataFilters";
import { useHeader } from "./HeaderContext";

export default function DatasetViewer() {
	const { datasetId } = useParams();
	const navigate = useNavigate();
	const [dataset, setDataset] = useState(null);
	const [datasets, setDatasets] = useState([]);
	const [chartData, setChartData] = useState(null); // Only chart data in memory
	const [totalRows, setTotalRows] = useState(0); // For preview display
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({});
	const [chartType, setChartType] = useState("bar");
	const [xAxis, setXAxis] = useState([]);
	const [yAxis, setYAxis] = useState([]);
	const [colorBy, setColorBy] = useState([]);
	const [categoryAxis, setCategoryAxis] = useState("");
	const [valueAxis, setValueAxis] = useState("");
	const [locationAxis, setLocationAxis] = useState("");
	const [openAxisPicker, setOpenAxisPicker] = useState(null);
	const [showPreview, setShowPreview] = useState(false);
	const [previewData, setPreviewData] = useState([]); // Small preview sample
	const { setHeader } = useHeader();

	const loadDataset = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			setFilters({});

			// Fetch dataset metadata
			const datasetInfo = await fetchDataset(datasetId);
			setDataset(datasetInfo);

			// Analyze dataset to get chart recommendations
			const analysisData = await analyzeDataset(datasetId);
			setAnalysis(analysisData);

			if (analysisData?.recommended_chart) {
				const recommended = analysisData.recommended_chart;
				setChartType(recommended.chart_type || "bar");
				setXAxis(recommended.x_axis ? [recommended.x_axis] : []);
				setYAxis(recommended.y_axis ? [recommended.y_axis] : []);
				setCategoryAxis(recommended.category || "");
				setValueAxis(recommended.value || "");
				setLocationAxis(recommended.location || "");
				setColorBy([]);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [datasetId]);

	useEffect(() => {
		loadDataset();
	}, [loadDataset]);

	useEffect(() => {
		const loadDatasetList = async () => {
			try {
				const response = await fetchDatasets();
				setDatasets(response.datasets || []);
			} catch (err) {
				console.error("Error loading dataset list:", err);
			}
		};

		loadDatasetList();
	}, []);

	const loadData = useCallback(async () => {
		try {
			// Initialize DuckDB
			await initDuckDB();

			const params = { limit: 10000 }; // Load more data into DuckDB
			const filterPayload = {};

			Object.entries(filters).forEach(([key, value]) => {
				if (value === null || value === undefined || value === "") {
					return;
				}

				if (dataset?.date_column && key === `${dataset.date_column}_from`) {
					params.date_from = value;
					return;
				}

				if (dataset?.date_column && key === `${dataset.date_column}_to`) {
					params.date_to = value;
					return;
				}

				filterPayload[key] = value;
			});

			if (Object.keys(filterPayload).length > 0) {
				params.filters = JSON.stringify(filterPayload);
			}

			// Fetch data from API
			const dataResponse = await fetchDatasetData(datasetId, params);

			// Load into DuckDB - data is NOT kept in JS memory
			await loadJSONData("dataset", dataResponse.data);

			// Get total row count
			const countResult = await duckQuery("SELECT COUNT(*) as count FROM dataset");
			setTotalRows(countResult[0]?.count || 0);

			// Get small preview sample (only 10 rows for preview)
			const preview = await duckQuery("SELECT * FROM dataset LIMIT 10");
			setPreviewData(preview);

			// Clear the raw data from memory - it's now in DuckDB
			console.log(`Loaded ${dataResponse.data.length} rows into DuckDB`);
		} catch (err) {
			console.error("Error loading data:", err);
		}
	}, [dataset, datasetId, filters]);

	useEffect(() => {
		if (dataset) {
			loadData();
		}
	}, [dataset, loadData]);

	const handleFilterChange = useCallback((newFilters) => {
		setFilters(newFilters);
	}, []);

	const handleChartTypeChange = useCallback((value) => {
		setChartType(value);
	}, []);

	const handleDatasetChange = useCallback(
		(value) => {
			if (value && value !== datasetId) {
				navigate(`/datasets/${value}`);
			}
		},
		[datasetId, navigate],
	);

	const columnData = useMemo(() => {
		const columns = analysis?.columns || [];
		const sortValues = (values) =>
			[...values].sort((a, b) => a.localeCompare(b));

		const temporalCols = columns.filter((col) => col.type === "temporal");
		const numericalCols = columns.filter((col) => col.type === "numerical");
		const categoricalCols = columns.filter((col) => col.type === "categorical");

		// Sort categorical by unique_count to find low-cardinality columns
		const categoricalByCardinality = [...categoricalCols].sort(
			(a, b) => (a.unique_count || 0) - (b.unique_count || 0),
		);

		return {
			allColumns: sortValues(columns.map((col) => col.name)),
			numericColumns: sortValues(numericalCols.map((col) => col.name)),
			categoricalColumns: sortValues(categoricalCols.map((col) => col.name)),
			temporalColumns: sortValues(temporalCols.map((col) => col.name)),
			geographicColumns: sortValues(
				columns.filter((col) => col.is_geographic).map((col) => col.name),
			),
			// For auto-selection: use original column objects for smart inference
			_temporalCols: temporalCols,
			_numericalCols: numericalCols,
			_categoricalCols: categoricalCols,
			_categoricalByCardinality: categoricalByCardinality,
		};
	}, [analysis]);

	const {
		allColumns,
		numericColumns,
		categoricalColumns,
		temporalColumns,
		geographicColumns,
		_temporalCols,
		_numericalCols,
		_categoricalCols,
		_categoricalByCardinality,
	} = columnData;

	// Infer schema and auto-select axes based on data types
	useEffect(() => {
		if (!analysis?.columns || analysis.columns.length === 0) {
			return;
		}

		// X-axis: First temporal column, fallback to first categorical (nominal)
		const autoX =
			_temporalCols[0]?.name || _categoricalCols[0]?.name || allColumns[0];
		setXAxis((prev) => (prev.length ? prev : autoX ? [autoX] : []));

		// Y-axis: First quantitative (numerical) column
		const autoY = _numericalCols[0]?.name || allColumns[0];
		setYAxis((prev) => (prev.length ? prev : autoY ? [autoY] : []));

		// Color: Second categorical column, or one with fewest unique values
		// Prefer low-cardinality columns for better color encoding
		const autoColor =
			_categoricalByCardinality[0]?.name &&
				_categoricalByCardinality[0].unique_count <= 10
				? _categoricalByCardinality[0].name
				: _categoricalCols[1]?.name || _categoricalCols[0]?.name;
		setColorBy((prev) => (prev.length ? prev : autoColor ? [autoColor] : []));

		setCategoryAxis(
			(prev) => prev || categoricalColumns[0] || allColumns[0] || "",
		);
		setValueAxis((prev) => prev || numericColumns[0] || allColumns[0] || "");
		setLocationAxis(
			(prev) =>
				prev ||
				geographicColumns[0] ||
				categoricalColumns[0] ||
				allColumns[0] ||
				"",
		);
	}, [
		analysis,
		allColumns,
		categoricalColumns,
		geographicColumns,
		numericColumns,
		_temporalCols,
		_numericalCols,
		_categoricalCols,
		_categoricalByCardinality,
	]);

	useEffect(() => {
		if (!analysis?.columns || analysis.columns.length === 0) {
			return;
		}

		if (["line", "bar"].includes(chartType)) {
			const preferredX =
				temporalColumns[0] || categoricalColumns[0] || allColumns[0] || "";
			const preferredY = numericColumns[0] || allColumns[0] || "";
			setXAxis((prev) => (prev.length ? prev : preferredX ? [preferredX] : []));
			setYAxis((prev) => (prev.length ? prev : preferredY ? [preferredY] : []));
			return;
		}

		if (chartType === "scatter") {
			const scatterX = numericColumns[0] || allColumns[0] || "";
			const scatterY =
				numericColumns[1] || numericColumns[0] || allColumns[0] || "";
			setXAxis((prev) => (prev.length ? prev : scatterX ? [scatterX] : []));
			setYAxis((prev) => (prev.length ? prev : scatterY ? [scatterY] : []));
		}
	}, [
		allColumns,
		analysis,
		categoricalColumns,
		chartType,
		numericColumns,
		temporalColumns,
	]);

	const selectedChart = useMemo(() => {
		if (!chartType) return null;

		if (chartType === "treemap") {
			if (!categoryAxis || !valueAxis) return null;
			return {
				chart_type: "treemap",
				title: `${valueAxis} by ${categoryAxis}`,
				category: categoryAxis,
				value: valueAxis,
			};
		}

		if (chartType === "map") {
			if (!locationAxis || !valueAxis) return null;
			return {
				chart_type: "map",
				title: `${valueAxis} by ${locationAxis}`,
				location: locationAxis,
				value: valueAxis,
			};
		}

		if (!xAxis.length || !yAxis.length) return null;
		return {
			chart_type: chartType,
			title: `${yAxis.join(", ")} by ${xAxis.join(", ")}`,
			x_axis: xAxis,
			y_axis: yAxis,
			color_by: colorBy,
		};
	}, [categoryAxis, chartType, colorBy, locationAxis, valueAxis, xAxis, yAxis]);

	// Query chart data from DuckDB when chart configuration changes
	useEffect(() => {
		const queryChartData = async () => {
			if (!selectedChart || totalRows === 0) {
				setChartData(null);
				return;
			}

			try {
				const { chart_type, x_axis, y_axis, category, value, location, color_by } = selectedChart;

				let sql = "";

				if (chart_type === "treemap") {
					// Aggregate by category
					sql = `
						SELECT "${category}", SUM(CAST("${value}" AS DOUBLE)) as "${value}"
						FROM dataset
						WHERE "${category}" IS NOT NULL AND "${value}" IS NOT NULL
						GROUP BY "${category}"
						ORDER BY "${value}" DESC
						LIMIT 50
					`;
				} else if (chart_type === "map") {
					// Aggregate by location
					sql = `
						SELECT "${location}", SUM(CAST("${value}" AS DOUBLE)) as "${value}"
						FROM dataset
						WHERE "${location}" IS NOT NULL AND "${value}" IS NOT NULL
						GROUP BY "${location}"
						ORDER BY "${value}" DESC
						LIMIT 50
					`;
				} else if (chart_type === "scatter") {
					// For scatter, get raw data points (limited)
					const xKey = Array.isArray(x_axis) ? x_axis[0] : x_axis;
					const yKey = Array.isArray(y_axis) ? y_axis[0] : y_axis;
					const colorKey = Array.isArray(color_by) && color_by.length > 0 ? color_by[0] : null;

					if (colorKey) {
						sql = `
							SELECT "${xKey}", "${yKey}", "${colorKey}"
							FROM dataset
							WHERE "${xKey}" IS NOT NULL AND "${yKey}" IS NOT NULL
							LIMIT 400
						`;
					} else {
						sql = `
							SELECT "${xKey}", "${yKey}"
							FROM dataset
							WHERE "${xKey}" IS NOT NULL AND "${yKey}" IS NOT NULL
							LIMIT 400
						`;
					}
				} else if (chart_type === "line" || chart_type === "bar") {
					// Aggregate data for line/bar charts
					const xKey = Array.isArray(x_axis) ? x_axis[0] : x_axis;
					const yKeys = Array.isArray(y_axis) ? y_axis : [y_axis];
					const colorKey = Array.isArray(color_by) && color_by.length > 0 ? color_by[0] : null;

					if (colorKey) {
						// Group by X and color
						const yKey = yKeys[0];
						sql = `
							SELECT "${xKey}", "${colorKey}", SUM(CAST("${yKey}" AS DOUBLE)) as "${yKey}"
							FROM dataset
							WHERE "${xKey}" IS NOT NULL AND "${yKey}" IS NOT NULL
							GROUP BY "${xKey}", "${colorKey}"
							ORDER BY "${xKey}"
							LIMIT 500
						`;
					} else {
						// Group by X only
						const selectClauses = yKeys.map(yKey => `SUM(CAST("${yKey}" AS DOUBLE)) as "${yKey}"`).join(", ");
						sql = `
							SELECT "${xKey}", ${selectClauses}
							FROM dataset
							WHERE "${xKey}" IS NOT NULL
							GROUP BY "${xKey}"
							ORDER BY "${xKey}"
							LIMIT 100
						`;
					}
				}

				if (sql) {
					const result = await duckQuery(sql);
					setChartData(result);
					console.log(`Queried ${result.length} rows for chart from DuckDB`);
				}
			} catch (err) {
				console.error("Error querying chart data:", err);
				setChartData(null);
			}
		};

		queryChartData();
	}, [selectedChart, totalRows]);

	const formatAxisList = useCallback((values) => {
		if (!values || values.length === 0) return "Select";
		if (values.length === 1) return values[0];
		if (values.length === 2) return `${values[0]}, ${values[1]}`;
		return `${values[0]} +${values.length - 1}`;
	}, []);

	const toggleAxisOption = (values, option) => {
		if (values.includes(option)) {
			return values.filter((value) => value !== option);
		}
		return [...values, option];
	};

	const renderMultiSelect = ({
		id,
		label,
		values,
		options,
		onChange,
		testId,
	}) => {
		const isOpen = openAxisPicker === id;

		return (
			<div className="relative min-w-[160px]">
				<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
					{label}
				</span>
				<button
					type="button"
					data-testid={testId}
					onClick={() => setOpenAxisPicker((prev) => (prev === id ? null : id))}
					className="input-field-compact flex items-center justify-between gap-2"
				>
					<span className="truncate text-left text-gray-700">
						{formatAxisList(values)}
					</span>
					<FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
				</button>
				{isOpen && (
					<div
						data-testid={`${id}-popover`}
						className="absolute left-0 right-0 mt-2 z-40 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
					>
						<div className="max-h-52 overflow-auto space-y-2">
							{options.map((option) => (
								<label
									key={option}
									className="flex items-center gap-2 text-xs text-gray-700"
								>
									<input
										type="checkbox"
										checked={values.includes(option)}
										onChange={() => onChange(toggleAxisOption(values, option))}
										className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-400"
									/>
									<span className="truncate">{option}</span>
								</label>
							))}
						</div>
						<div className="flex items-center justify-between mt-3 text-xs">
							<button
								type="button"
								onClick={() => onChange([])}
								className="text-gray-500 hover:text-gray-700"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => setOpenAxisPicker(null)}
								className="btn-primary text-xs px-3 py-1"
							>
								Done
							</button>
						</div>
					</div>
				)}
			</div>
		);
	};

	const headerContent = useMemo(() => {
		if (!dataset) return null;

		const chartTitle = selectedChart
			? ["treemap", "map"].includes(selectedChart.chart_type)
				? selectedChart.title
				: `${formatAxisList(yAxis)} by ${formatAxisList(xAxis)}`
			: "Chart";

		return (
			<div className="flex flex-col gap-1 min-w-0">
				<div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
					<Link
						to="/datasets"
						className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
					>
						<FiArrowLeft className="mr-1" />
						Back
					</Link>
					<span
						data-testid="dataset-title"
						className="text-xs font-semibold text-gray-900"
					>
						{dataset.name}
					</span>
					<span className="text-xs text-gray-500">{chartTitle}</span>
					<span className="text-xs text-gray-500">{dataset.provider}</span>
					<span className="text-xs text-gray-500">{dataset.category}</span>
				</div>
				{analysis?.statistics && (
					<div className="flex items-center gap-3 text-[11px] text-gray-500">
						<span>
							Total: {analysis.statistics.total_rows?.toLocaleString()}
						</span>
						<span>Cols: {analysis.statistics.total_columns}</span>
						<span>
							Time: {analysis.statistics.has_time_series ? "Yes" : "No"}
						</span>
						<span>
							Geo: {analysis.statistics.has_geographic ? "Yes" : "No"}
						</span>
					</div>
				)}
			</div>
		);
	}, [analysis, dataset, selectedChart, xAxis, yAxis, formatAxisList]);

	useEffect(() => {
		setHeader(headerContent);
		return () => setHeader(null);
	}, [headerContent, setHeader]);

	if (loading) {
		return (
			<div className="flex items-start gap-3 py-12">
				<div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
				<p className="text-gray-600">Loading dataset...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<Link
					to="/datasets"
					className="inline-flex items-center text-primary-600 hover:text-primary-700"
				>
					<FiArrowLeft className="mr-2" />
					Back to Datasets
				</Link>
				<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
					<p className="text-red-800">Error: {error}</p>
					<button
						type="button"
						onClick={loadDataset}
						className="btn-primary mt-2"
					>
						<FiRefreshCw className="inline mr-2" />
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden">
			<section className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-2 flex-1 min-h-0 overflow-hidden">
				{/* Filters Sidebar */}
				<div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] min-h-0">
					<DataFilters
						filters={analysis?.filters || []}
						currentFilters={filters}
						onChange={handleFilterChange}
					/>
				</div>

				{/* Chart Area */}
				<div className="flex flex-col gap-1 min-h-0 overflow-hidden">
					<div className="rounded-2xl border border-gray-200 bg-white/80 p-2">
						<div className="flex flex-wrap items-end gap-3">
							<div className="flex items-center gap-1 min-w-[150px]">
								<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
									Dataset
								</span>
								<select
									data-testid="dataset-select"
									value={datasetId}
									onChange={(e) => handleDatasetChange(e.target.value)}
									className="input-field-compact"
								>
									{datasets.length === 0 && dataset?.name && (
										<option value={datasetId}>{dataset.name}</option>
									)}
									{datasets.map((item) => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-center gap-1 min-w-[120px]">
								<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
									Chart
								</span>
								<select
									data-testid="chart-type-select"
									value={chartType}
									onChange={(e) => handleChartTypeChange(e.target.value)}
									className="input-field-compact"
									disabled={allColumns.length === 0}
								>
									<option value="line">Line</option>
									<option value="bar">Bar</option>
									<option value="scatter">Scatter</option>
									<option value="treemap">Treemap</option>
									<option value="map">Map</option>
								</select>
							</div>
							{["line", "bar", "scatter"].includes(chartType) && (
								<>
									{renderMultiSelect({
										id: "x-axis",
										label: "X",
										values: xAxis,
										options: allColumns,
										onChange: setXAxis,
										testId: "x-axis-select",
									})}
									{renderMultiSelect({
										id: "y-axis",
										label: "Y",
										values: yAxis,
										options: allColumns,
										onChange: setYAxis,
										testId: "y-axis-select",
									})}
									{renderMultiSelect({
										id: "color-by",
										label: "Colour",
										values: colorBy,
										options: allColumns,
										onChange: setColorBy,
										testId: "color-by-select",
									})}
								</>
							)}
							{chartType === "treemap" && (
								<>
									<div className="flex items-center gap-1 min-w-[150px]">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Category
										</span>
										<select
											data-testid="category-select"
											value={categoryAxis}
											onChange={(e) => setCategoryAxis(e.target.value)}
											className="input-field-compact"
										>
											{(categoricalColumns.length
												? categoricalColumns
												: allColumns
											).map((col) => (
												<option key={col} value={col}>
													{col}
												</option>
											))}
										</select>
									</div>
									<div className="flex items-center gap-1 min-w-[130px]">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Value
										</span>
										<select
											data-testid="value-select"
											value={valueAxis}
											onChange={(e) => setValueAxis(e.target.value)}
											className="input-field-compact"
										>
											{(numericColumns.length
												? numericColumns
												: allColumns
											).map((col) => (
												<option key={col} value={col}>
													{col}
												</option>
											))}
										</select>
									</div>
								</>
							)}
							{chartType === "map" && (
								<>
									<div className="flex items-center gap-1 min-w-[150px]">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Location
										</span>
										<select
											data-testid="location-select"
											value={locationAxis}
											onChange={(e) => setLocationAxis(e.target.value)}
											className="input-field-compact"
										>
											{(geographicColumns.length
												? geographicColumns
												: allColumns
											).map((col) => (
												<option key={col} value={col}>
													{col}
												</option>
											))}
										</select>
									</div>
									<div className="flex items-center gap-1 min-w-[130px]">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Value
										</span>
										<select
											data-testid="map-value-select"
											value={valueAxis}
											onChange={(e) => setValueAxis(e.target.value)}
											className="input-field-compact"
										>
											{(numericColumns.length
												? numericColumns
												: allColumns
											).map((col) => (
												<option key={col} value={col}>
													{col}
												</option>
											))}
										</select>
									</div>
								</>
							)}
							<button
								type="button"
								onClick={loadDataset}
								className="ml-auto text-xs px-2 py-1 border border-gray-200 rounded-full hover:bg-white"
							>
								<FiRefreshCw className="inline mr-1" />
								Refresh
							</button>
						</div>
					</div>
					<div
						data-testid="chart-section"
						className="flex-1 min-h-0 relative rounded-2xl border border-gray-200 bg-white/80 overflow-hidden"
					>
						{chartData && selectedChart ? (
							<div className="h-full">
								<Chart data={chartData} chartConfig={selectedChart} />
							</div>
						) : (
							<div className="text-left text-sm text-gray-500 p-3">
								Select a chart configuration to get started.
							</div>
						)}

						{previewData?.length > 0 && (
							<div
								className={`absolute left-2 right-2 bottom-2 rounded-xl border border-gray-200 bg-white/95 shadow-lg transition-all duration-200 ${showPreview ? "max-h-80" : "h-10"
									}`}
							>
								<button
									type="button"
									onClick={() => setShowPreview((prev) => !prev)}
									className="w-full h-10 flex items-center justify-between px-3 text-xs uppercase tracking-[0.2em] text-gray-600"
								>
									<span>Data preview</span>
									<span>{totalRows?.toLocaleString()} rows</span>
								</button>
								{showPreview && (
									<div className="max-h-[calc(20rem-2.5rem)] overflow-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50 sticky top-0">
												<tr>
													{Object.keys(previewData[0])
														.slice(0, 6)
														.map((key) => (
															<th
																key={key}
																className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
															>
																{key}
															</th>
														))}
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{previewData.slice(0, 10).map((row, index) => {
													const rowEntries = Object.entries(row).slice(0, 6);
													return (
														<tr key={`${rowEntries[0]?.[1]}-${index}`}>
															{rowEntries.map(([key, value]) => (
																<td
																	key={key}
																	className="px-3 py-2 whitespace-nowrap text-xs text-gray-700"
																>
																	{value}
																</td>
															))}
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
