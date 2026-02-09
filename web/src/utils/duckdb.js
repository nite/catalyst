import * as duckdb from "@duckdb/duckdb-wasm";
import * as arrow from "apache-arrow";

let db = null;
let conn = null;

/**
 * Initialize DuckDB WASM instance
 */
export async function initDuckDB() {
	if (db) return { db, conn };

	try {
		const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

		// Select a bundle based on browser support
		const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

		const worker_url = URL.createObjectURL(
			new Blob([`importScripts("${bundle.mainWorker}");`], {
				type: "text/javascript",
			}),
		);

		const worker = new Worker(worker_url);
		const logger = new duckdb.ConsoleLogger();
		db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
		URL.revokeObjectURL(worker_url);

		conn = await db.connect();

		console.log("DuckDB initialized successfully");
		return { db, conn };
	} catch (error) {
		console.error("Failed to initialize DuckDB:", error);
		throw error;
	}
}

/**
 * Get the current connection, initializing if necessary
 */
export async function getConnection() {
	if (!conn) {
		await initDuckDB();
	}
	return conn;
}

/**
 * Load data into DuckDB from Arrow format
 * @param {string} tableName - Name of the table to create
 * @param {ArrayBuffer} arrowData - Arrow IPC data
 */
export async function loadArrowData(tableName, arrowData) {
	const connection = await getConnection();

	try {
		// Drop table if it exists
		await connection.query(`DROP TABLE IF EXISTS ${tableName}`);

		// Insert Arrow data
		await db.registerFileBuffer(
			`${tableName}.arrow`,
			new Uint8Array(arrowData),
		);
		await connection.query(
			`CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${tableName}.arrow')`,
		);

		console.log(`Loaded data into table: ${tableName}`);
	} catch (error) {
		console.error(`Failed to load Arrow data into ${tableName}:`, error);
		throw error;
	}
}

/**
 * Load data from JSON array
 * @param {string} tableName - Name of the table to create
 * @param {Array} jsonData - Array of objects
 */
export async function loadJSONData(tableName, jsonData) {
	const connection = await getConnection();

	try {
		// Drop table if it exists
		await connection.query(`DROP TABLE IF EXISTS ${tableName}`);

		// Convert JSON to Arrow Table
		const arrowTable = arrow.tableFromJSON(jsonData);

		// Insert the table
		await db.registerFileBuffer(
			`${tableName}.arrow`,
			arrow.tableToIPC(arrowTable),
		);
		await connection.query(
			`CREATE TABLE ${tableName} AS SELECT * FROM arrow_scan('${tableName}.arrow')`,
		);

		console.log(`Loaded ${jsonData.length} rows into table: ${tableName}`);
	} catch (error) {
		console.error(`Failed to load JSON data into ${tableName}:`, error);
		throw error;
	}
}

/**
 * Execute a SQL query and return results as an array of objects
 * @param {string} sql - SQL query to execute
 * @returns {Promise<Array>} Query results
 */
export async function query(sql) {
	const connection = await getConnection();

	try {
		const result = await connection.query(sql);
		const rows = result.toArray().map((row) => row.toJSON());
		return rows;
	} catch (error) {
		console.error("Query failed:", error);
		throw error;
	}
}

/**
 * Execute a SQL query and return results as Arrow Table
 * @param {string} sql - SQL query to execute
 * @returns {Promise<arrow.Table>} Query results as Arrow Table
 */
export async function queryArrow(sql) {
	const connection = await getConnection();

	try {
		const result = await connection.query(sql);
		return result;
	} catch (error) {
		console.error("Query failed:", error);
		throw error;
	}
}

/**
 * Get table schema
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>} Array of column definitions
 */
export async function getTableSchema(tableName) {
	const sql = `DESCRIBE ${tableName}`;
	return await query(sql);
}

/**
 * Close the DuckDB connection
 */
export async function closeDuckDB() {
	if (conn) {
		await conn.close();
		conn = null;
	}
	if (db) {
		await db.terminate();
		db = null;
	}
	console.log("DuckDB connection closed");
}
