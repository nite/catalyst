import { useCallback, useEffect, useMemo, useState } from "react";
import {
	FiArrowLeft,
	FiChevronDown,
	FiInfo,
	FiRefreshCw,
	FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	analyzeDataset,
	fetchDataset,
	fetchDatasetData,
	fetchDatasets,
} from "../utils/api";
import Chart from "./Chart";
import DataFilters from "./DataFilters";
import { useHeader } from "./HeaderContext";

export default function DatasetViewer() {
	const { datasetId } = useParams();
	const navigate = useNavigate();
	const [dataset, setDataset] = useState(null);
	const [datasets, setDatasets] = useState([]);
	const [data, setData] = useState(null);
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
	const [showCoverage, setShowCoverage] = useState(false);
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
			const params = { limit: 500 };
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

			const dataResponse = await fetchDatasetData(datasetId, params);
			setData(dataResponse);
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

	const activeFilterEntries = useMemo(() => {
		return Object.entries(filters).filter(([, value]) => {
			if (value === null || value === undefined) return false;
			if (Array.isArray(value)) return value.length > 0;
			if (typeof value === "string") return value.trim() !== "";
			return true;
		});
	}, [filters]);

	const clearAllFilters = useCallback(() => {
		setFilters({});
	}, []);

	const removeFilter = useCallback((key) => {
		setFilters((prev) => {
			const updated = { ...prev };
			delete updated[key];
			return updated;
		});
	}, []);

	const formatFilterValue = useCallback((value) => {
		if (Array.isArray(value)) {
			return value.length > 2
				? `${value.slice(0, 2).join(", ")}...`
				: value.join(", ");
		}
		const str = String(value);
		return str.length > 20 ? `${str.slice(0, 20)}...` : str;
	}, []);

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

					{/* KPI strip with dataset summary - Priority 2 */}
					{analysis?.statistics && data && (
						<div
							data-testid="kpi-strip"
							className="rounded-2xl border border-gray-200 bg-gradient-to-r from-primary-50/50 to-white/80 p-3"
						>
							<div className="flex items-center gap-6 flex-wrap">
								<div className="flex flex-col">
									<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
										Total Rows
									</span>
									<span className="text-xl font-semibold text-gray-900">
										{(
											data.total ||
											analysis.statistics.total_rows ||
											0
										).toLocaleString()}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
										Columns
									</span>
									<span className="text-xl font-semibold text-gray-900">
										{analysis.statistics.total_columns}
									</span>
								</div>
								{analysis.statistics.has_time_series && analysis.columns && (
									<div className="flex flex-col">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Time Range
										</span>
										<span className="text-sm font-medium text-gray-700">
											{(() => {
												const temporalCol = analysis.columns.find(
													(col) => col.type === "temporal",
												);
												if (temporalCol?.min_value && temporalCol?.max_value) {
													return `${temporalCol.min_value} - ${temporalCol.max_value}`;
												}
												return "Available";
											})()}
										</span>
									</div>
								)}
								{analysis.statistics.has_geographic && (
									<div className="flex flex-col">
										<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Geographic
										</span>
										<span className="text-sm font-medium text-primary-700">
											✓ Available
										</span>
									</div>
								)}
								{analysis.columns &&
									analysis.columns.filter((col) => col.type === "numerical")
										.length > 0 && (
										<div className="flex flex-col">
											<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
												Metrics
											</span>
											<span className="text-sm font-medium text-gray-700">
												{
													analysis.columns.filter(
														(col) => col.type === "numerical",
													).length
												}{" "}
												numerical
											</span>
										</div>
									)}
								<button
									type="button"
									data-testid="toggle-coverage-panel"
									onClick={() => setShowCoverage((prev) => !prev)}
									className="ml-auto text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:bg-white transition-colors inline-flex items-center gap-1.5"
								>
									<FiInfo className="h-3.5 w-3.5" />
									{showCoverage ? "Hide" : "Show"} Coverage
								</button>
							</div>
						</div>
					)}

					{/* Dataset coverage panel - Priority 3 */}
					{showCoverage && analysis && dataset && (
						<div
							data-testid="coverage-panel"
							className="rounded-2xl border border-gray-200 bg-white/80 p-3"
						>
							<h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-[0.2em]">
								Dataset Coverage
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{/* Time coverage */}
								{analysis.columns?.find((col) => col.type === "temporal") && (
									<div className="space-y-1">
										<div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
											Time Coverage
										</div>
										{(() => {
											const temporalCol = analysis.columns.find(
												(col) => col.type === "temporal",
											);
											if (temporalCol) {
												return (
													<div className="text-sm text-gray-700">
														<div>
															<strong>From:</strong>{" "}
															{temporalCol.min_value || "N/A"}
														</div>
														<div>
															<strong>To:</strong>{" "}
															{temporalCol.max_value || "N/A"}
														</div>
														<div className="text-xs text-gray-500 mt-1">
															{temporalCol.unique_count
																? `${temporalCol.unique_count.toLocaleString()} unique dates`
																: ""}
														</div>
													</div>
												);
											}
											return (
												<div className="text-sm text-gray-500">
													Not available
												</div>
											);
										})()}
									</div>
								)}

								{/* Geographic coverage */}
								{analysis.columns &&
									analysis.columns.filter((col) => col.is_geographic).length >
										0 && (
										<div className="space-y-1">
											<div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
												Geographic Coverage
											</div>
											<div className="text-sm text-gray-700">
												{analysis.columns
													.filter((col) => col.is_geographic)
													.map((col) => (
														<div key={col.name} className="mb-1">
															<strong>{col.name}:</strong>{" "}
															{col.unique_count
																? `${col.unique_count.toLocaleString()} locations`
																: "Available"}
														</div>
													))}
											</div>
										</div>
									)}

								{/* Data freshness */}
								<div className="space-y-1">
									<div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
										Data Freshness
									</div>
									<div className="text-sm text-gray-700">
										<div>
											<strong>Provider:</strong> {dataset.provider || "N/A"}
										</div>
										<div>
											<strong>Category:</strong> {dataset.category || "N/A"}
										</div>
										<div className="text-xs text-gray-500 mt-1">
											Last updated: Available on demand
										</div>
									</div>
								</div>

								{/* Data quality indicators */}
								<div className="space-y-1">
									<div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
										Data Quality
									</div>
									<div className="text-sm text-gray-700">
										<div>
											<strong>Completeness:</strong>{" "}
											{analysis.statistics?.total_rows > 0
												? "✓ Good"
												: "⚠ Limited"}
										</div>
										<div>
											<strong>Data Types:</strong>{" "}
											{analysis.columns
												? `${analysis.columns.length} columns`
												: "N/A"}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Filter chips row - Priority 1 */}
					{activeFilterEntries.length > 0 && (
						<div
							data-testid="filter-chips-row"
							className="rounded-2xl border border-gray-200 bg-white/80 p-2"
						>
							<div className="flex items-center gap-2 flex-wrap">
								<span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">
									Active Filters
								</span>
								<div className="flex items-center gap-2 flex-wrap flex-1">
									{activeFilterEntries.map(([key, value]) => (
										<button
											key={key}
											type="button"
											data-testid={`filter-chip-${key}`}
											onClick={() => removeFilter(key)}
											className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
										>
											<span className="truncate max-w-[200px]">
												{key.replace(/_/g, " ")}: {formatFilterValue(value)}
											</span>
											<FiX className="h-3.5 w-3.5 flex-shrink-0" />
										</button>
									))}
								</div>
								<button
									type="button"
									data-testid="clear-all-filters"
									onClick={clearAllFilters}
									className="text-xs px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
								>
									Clear All
								</button>
							</div>
						</div>
					)}

					<div
						data-testid="chart-section"
						className="flex-1 min-h-0 relative rounded-2xl border border-gray-200 bg-white/80 overflow-hidden"
					>
						{data && selectedChart ? (
							<div className="h-full">
								<Chart data={data.data} chartConfig={selectedChart} />
							</div>
						) : (
							<div className="text-left text-sm text-gray-500 p-3">
								Select a chart configuration to get started.
							</div>
						)}

						{data?.data?.length > 0 && (
							<div
								className={`absolute left-2 right-2 bottom-2 rounded-xl border border-gray-200 bg-white/95 shadow-lg transition-all duration-200 ${
									showPreview ? "max-h-80" : "h-10"
								}`}
							>
								<button
									type="button"
									onClick={() => setShowPreview((prev) => !prev)}
									className="w-full h-10 flex items-center justify-between px-3 text-xs uppercase tracking-[0.2em] text-gray-600"
								>
									<span>Data preview</span>
									<span>{data.total?.toLocaleString()} rows</span>
								</button>
								{showPreview && (
									<div className="max-h-[calc(20rem-2.5rem)] overflow-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50 sticky top-0">
												<tr>
													{Object.keys(data.data[0])
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
												{data.data.slice(0, 10).map((row, index) => {
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
