/**
 * Build SQL WHERE clause from filter state
 * @param {Object} filters - Current filter values
 * @param {Array<Object>} filterConfigs - Filter configurations from analyzer
 * @returns {string} WHERE clause (without WHERE keyword) or empty string
 */
export function buildWhereClause(filters, filterConfigs) {
	if (!filters || !filterConfigs || filterConfigs.length === 0) {
		return "";
	}

	const conditions = [];

	for (const config of filterConfigs) {
		const filterValue = filters[config.column];
		if (!filterValue) continue;

		const column = `"${config.column}"`;

		switch (config.filter_type) {
			case "date_range":
			case "range": {
				const { min, max } = filterValue;
				if (min != null && max != null) {
					conditions.push(`${column} BETWEEN ${min} AND ${max}`);
				} else if (min != null) {
					conditions.push(`${column} >= ${min}`);
				} else if (max != null) {
					conditions.push(`${column} <= ${max}`);
				}
				break;
			}

			case "multi_select": {
				if (Array.isArray(filterValue) && filterValue.length > 0) {
					// Escape single quotes in values
					const escapedValues = filterValue.map((v) =>
						typeof v === "string"
							? `'${v.replace(/'/g, "''")}'`
							: v,
					);
					conditions.push(`${column} IN (${escapedValues.join(", ")})`);
				}
				break;
			}

			default:
				// Exact match
				if (filterValue != null) {
					const escapedValue =
						typeof filterValue === "string"
							? `'${filterValue.replace(/'/g, "''")}'`
							: filterValue;
					conditions.push(`${column} = ${escapedValue}`);
				}
		}
	}

	return conditions.length > 0 ? conditions.join(" AND ") : "";
}

/**
 * Build aggregation SQL query for chart data
 * @param {Object} chartConfig - Chart configuration {chart_type, x_axis, y_axis, color_by, aggregation}
 * @param {Object} filters - Current filter values
 * @param {Array<Object>} filterConfigs - Filter configurations
 * @returns {string} Complete SQL query
 */
export function buildAggregationQuery(chartConfig, filters, filterConfigs) {
	const { x_axis, y_axis, color_by, aggregation = "SUM" } = chartConfig;

	// Handle x_axis (can be array or single value)
	const xAxisColumns = Array.isArray(x_axis) ? x_axis : [x_axis];
	const xAxisColumn = xAxisColumns[0] || ""; // Use first x-axis for now

	// Handle y_axis (aggregation target)
	const yAxisColumns = Array.isArray(y_axis) ? y_axis : [y_axis];
	const yAxisColumn = yAxisColumns[0] || "";
	// Validate we have required columns
	if (!xAxisColumn || !yAxisColumn) {
		throw new Error("Both x_axis and y_axis are required for aggregation query");
	}
	// Handle color_by (grouping)
	const colorByColumns = Array.isArray(color_by) ? color_by : [color_by];
	const colorByColumn =
		colorByColumns.length > 0 && colorByColumns[0] ? colorByColumns[0] : null;

	// Build SELECT clause
	let selectClause = `"${xAxisColumn}" as x_label`;

	// Add color_by if present
	if (colorByColumn) {
		selectClause += `, "${colorByColumn}" as group_by`;
	}

	// Add aggregation
	const aggFunc = buildAggregationFunction(aggregation, yAxisColumn);
	selectClause += `, ${aggFunc} as y_value`;

	// Build GROUP BY clause
	let groupByClause = `"${xAxisColumn}"`;
	if (colorByColumn) {
		groupByClause += `, "${colorByColumn}"`;
	}

	// Build WHERE clause
	const whereClause = buildWhereClause(filters, filterConfigs);

	// Build ORDER BY clause (order by x_label by default)
	const orderByClause = `"${xAxisColumn}"`;

	// Assemble query
	let query = `SELECT ${selectClause} FROM {table}`;
	if (whereClause) {
		query += ` WHERE ${whereClause}`;
	}
	query += ` GROUP BY ${groupByClause}`;
	query += ` ORDER BY ${orderByClause}`;

	// Add LIMIT to prevent overwhelming charts
	query += " LIMIT 1000";

	return query;
}

/**
 * Build aggregation function SQL
 * @param {string} aggregation - Aggregation type (SUM, AVG, COUNT, MIN, MAX, MEDIAN, STDDEV, P25, P75, P90, or custom SQL)
 * @param {string} column - Column to aggregate
 * @returns {string} SQL aggregation expression
 */
export function buildAggregationFunction(aggregation, column) {
	const col = `"${column}"`;

	switch (aggregation) {
		case "SUM":
			return `SUM(${col})`;
		case "AVG":
			return `AVG(${col})`;
		case "COUNT":
			return "COUNT(*)";
		case "MIN":
			return `MIN(${col})`;
		case "MAX":
			return `MAX(${col})`;
		case "MEDIAN":
			return `percentile_cont(0.5) WITHIN GROUP (ORDER BY ${col})`;
		case "STDDEV":
			return `STDDEV(${col})`;
		case "P25":
			return `percentile_cont(0.25) WITHIN GROUP (ORDER BY ${col})`;
		case "P75":
			return `percentile_cont(0.75) WITHIN GROUP (ORDER BY ${col})`;
		case "P90":
			return `percentile_cont(0.90) WITHIN GROUP (ORDER BY ${col})`;
		default:
			// Custom SQL expression (e.g., "SUM(price * volume) / SUM(volume)")
			// Replace {column} placeholder if present
			if (aggregation.includes("{column}")) {
				return aggregation.replace(/\{column\}/g, col);
			}
			// Otherwise, treat as literal SQL
			return aggregation;
	}
}

/**
 * Build simple SELECT query with filters (for non-aggregated data)
 * @param {Object} filters - Current filter values
 * @param {Array<Object>} filterConfigs - Filter configurations
 * @param {number} limit - Row limit (default 1000)
 * @returns {string} SQL query
 */
export function buildSelectQuery(filters, filterConfigs, limit = 1000) {
	const whereClause = buildWhereClause(filters, filterConfigs);

	let query = "SELECT * FROM {table}";
	if (whereClause) {
		query += ` WHERE ${whereClause}`;
	}
	query += ` LIMIT ${limit}`;

	return query;
}

/**
 * Build query for dataset preview (first N rows)
 * @param {number} limit - Row limit
 * @returns {string} SQL query
 */
export function buildPreviewQuery(limit = 100) {
	return `SELECT * FROM {table} LIMIT ${limit}`;
}

/**
 * Build query to get distinct values for a column (for filter options)
 * @param {string} column - Column name
 * @param {number} limit - Max distinct values
 * @returns {string} SQL query
 */
export function buildDistinctValuesQuery(column, limit = 1000) {
	return `SELECT DISTINCT "${column}" as value FROM {table} WHERE "${column}" IS NOT NULL ORDER BY "${column}" LIMIT ${limit}`;
}

/**
 * Build query to get column statistics (min, max, count)
 * @param {string} column - Column name
 * @returns {string} SQL query
 */
export function buildColumnStatsQuery(column) {
	return `
		SELECT 
			MIN("${column}") as min,
			MAX("${column}") as max,
			COUNT(DISTINCT "${column}") as unique_count,
			COUNT(*) as total_count
		FROM {table}
		WHERE "${column}" IS NOT NULL
	`;
}
