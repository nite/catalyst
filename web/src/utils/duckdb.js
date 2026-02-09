import initSqlJs from "sql.js";

let db = null;
let SQL = null;

/**
 * Initialize SQL.js database (SQLite in WebAssembly)
 */
export async function initDuckDB() {
	if (db) return { db };

	try {
		if (!SQL) {
			SQL = await initSqlJs({
				locateFile: (file) => `https://sql.js.org/dist/${file}`,
			});
		}

		db = new SQL.Database();
		console.log("SQL.js database initialized successfully");
		return { db };
	} catch (error) {
		console.error("Failed to initialize SQL.js:", error);
		throw error;
	}
}

/**
 * Get the current database, initializing if necessary
 */
export async function getConnection() {
	if (!db) {
		await initDuckDB();
	}
	return db;
}

/**
 * Load data from JSON array
 * @param {string} tableName - Name of the table to create
 * @param {Array} jsonData - Array of objects
 */
export async function loadJSONData(tableName, jsonData) {
	const database = await getConnection();

	try {
		// Drop table if it exists
		try {
			database.run(`DROP TABLE IF EXISTS ${tableName}`);
		} catch (e) {
			// Table might not exist, ignore
		}

		if (jsonData.length === 0) {
			// Create empty table
			database.run(`CREATE TABLE ${tableName} (placeholder TEXT)`);
			console.log(`Created empty table: ${tableName}`);
			return;
		}

		// Infer schema from first row
		const firstRow = jsonData[0];
		const columns = Object.keys(firstRow);
		const columnDefs = columns
			.map((col) => `"${col}" TEXT`)
			.join(", ");

		// Create table
		database.run(`CREATE TABLE ${tableName} (${columnDefs})`);

		// Prepare insert statement
		const placeholders = columns.map(() => "?").join(", ");
		const insertSQL = `INSERT INTO ${tableName} VALUES (${placeholders})`;

		// Insert all rows
		for (const row of jsonData) {
			const values = columns.map((col) => {
				const val = row[col];
				return val === null || val === undefined ? null : String(val);
			});
			database.run(insertSQL, values);
		}

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
	const database = await getConnection();

	try {
		const result = database.exec(sql);

		if (result.length === 0) {
			return [];
		}

		const columns = result[0].columns;
		const values = result[0].values;

		// Convert to array of objects
		return values.map((row) => {
			const obj = {};
			columns.forEach((col, idx) => {
				obj[col] = row[idx];
			});
			return obj;
		});
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
	const sql = `PRAGMA table_info(${tableName})`;
	const result = await query(sql);
	return result.map((row) => ({
		column_name: row.name,
		column_type: row.type,
	}));
}

/**
 * Close the database connection
 */
export async function closeDuckDB() {
	if (db) {
		db.close();
		db = null;
	}
	console.log("SQL.js database connection closed");
}
