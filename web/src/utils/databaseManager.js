import { getConnection, getDB } from "./duckdb";

/**
 * Map column type from analyzer to DuckDB type
 * @param {Object} column - Column metadata from analyzer
 * @returns {string} DuckDB type
 */
function mapColumnType(column) {
	switch (column.type) {
		case "temporal":
			// Check if it's just a year (integer) or actual date
			if (column.dtype === "int64" || column.dtype === "int32") {
				return "INTEGER";
			}
			return "TIMESTAMP";
		case "numerical":
			if (
				column.dtype === "int64" ||
				column.dtype === "int32" ||
				column.dtype === "int16"
			) {
				return "BIGINT";
			}
			return "DOUBLE";
		case "categorical":
		case "text":
		default:
			return "VARCHAR";
	}
}

/**
 * Sanitize table name to be SQL-safe
 * @param {string} datasetId
 * @returns {string}
 */
function sanitizeTableName(datasetId) {
	// Replace non-alphanumeric characters with underscores
	return `dataset_${datasetId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

/**
 * Load dataset into DuckDB as a table
 * @param {string} datasetId - Unique dataset identifier
 * @param {Array<Object>} rows - Array of data rows
 * @param {Array<Object>} columnMetadata - Column type info from analyzer
 * @returns {Promise<{tableName: string, rowCount: number}>}
 */
export async function loadDataset(datasetId, rows, columnMetadata) {
	const connection = await getConnection();
	const tableName = sanitizeTableName(datasetId);

	try {
		// Drop existing table if it exists
		await connection.query(`DROP TABLE IF EXISTS ${tableName}`);

		if (!rows || rows.length === 0) {
			throw new Error("No data to load");
		}

		// Create schema from column metadata
		const columns = columnMetadata || [];
		let createTableSQL;

		if (columns.length > 0) {
			// Use analyzer metadata to create typed schema
			const columnDefs = columns
				.map((col) => {
					const colType = mapColumnType(col);
					return `"${col.name}" ${colType}`;
				})
				.join(", ");

			createTableSQL = `CREATE TABLE ${tableName} (${columnDefs})`;
		} else {
			// Fallback: infer from first row (all VARCHAR)
			const firstRow = rows[0];
			const columnDefs = Object.keys(firstRow)
				.map((key) => `"${key}" VARCHAR`)
				.join(", ");

			createTableSQL = `CREATE TABLE ${tableName} (${columnDefs})`;
		}

		await connection.query(createTableSQL);

		// Insert data using DuckDB's virtual file system and JSON reader
		// This is the most reliable method and handles all escaping automatically
		const db = await getDB();
		const batchSize = 5000;
		
		for (let i = 0; i < rows.length; i += batchSize) {
			const batch = rows.slice(i, i + batchSize);
			
			// Convert to newline-delimited JSON (more efficient for DuckDB)
			const ndjson = batch.map(row => JSON.stringify(row)).join('\n');
			
			// Register as virtual file
			const fileName = `temp_${tableName}_${i}.ndjson`;
			await db.registerFileText(fileName, ndjson);
			
			// Insert using read_json_auto
			await connection.query(
				`INSERT INTO ${tableName} SELECT * FROM read_json_auto('${fileName}')`
			);
			
			// Unregister file to free memory
			await db.dropFile(fileName);
		}

		console.log(
			`Loaded ${rows.length} rows into DuckDB table: ${tableName}`,
		);
		return { tableName, rowCount: rows.length };
	} catch (error) {
		console.error(`Failed to load dataset ${datasetId}:`, error);
		throw error;
	}
}

/**
 * Execute SQL query on a dataset
 * @param {string} datasetId - Dataset identifier
 * @param {string} sql - SQL query (can use {table} placeholder)
 * @returns {Promise<Array<Object>>} Query results as array of objects
 */
export async function queryDataset(datasetId, sql) {
	const connection = await getConnection();
	const tableName = sanitizeTableName(datasetId);

	try {
		// Replace {table} placeholder with actual table name
		const querySQL = sql.replace(/\{table\}/g, tableName);

		const result = await connection.query(querySQL);
		return result.toArray().map((row) => row.toJSON());
	} catch (error) {
		console.error(`Query failed for dataset ${datasetId}:`, error);
		console.error("SQL:", sql);
		throw error;
	}
}

/**
 * Get table info (column names and types)
 * @param {string} datasetId
 * @returns {Promise<Array<{name: string, type: string}>>}
 */
export async function getTableInfo(datasetId) {
	const connection = await getConnection();
	const tableName = sanitizeTableName(datasetId);

	try {
		const result = await connection.query(`DESCRIBE ${tableName}`);
		return result.toArray().map((row) => ({
			name: row.column_name,
			type: row.column_type,
		}));
	} catch (error) {
		console.error(`Failed to get table info for ${datasetId}:`, error);
		throw error;
	}
}

/**
 * Drop dataset table from DuckDB
 * @param {string} datasetId
 */
export async function dropDataset(datasetId) {
	const connection = await getConnection();
	const tableName = sanitizeTableName(datasetId);

	try {
		await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
		console.log(`Dropped table: ${tableName}`);
	} catch (error) {
		console.error(`Failed to drop table ${tableName}:`, error);
		// Don't throw - cleanup should be non-blocking
	}
}

/**
 * Get row count for a dataset
 * @param {string} datasetId
 * @returns {Promise<number>}
 */
export async function getRowCount(datasetId) {
	const result = await queryDataset(
		datasetId,
		"SELECT COUNT(*) as count FROM {table}",
	);
	return result[0]?.count || 0;
}
