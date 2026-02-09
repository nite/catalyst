import * as duckdb from "@duckdb/duckdb-wasm";

let dbInstance = null;
let connectionInstance = null;

/**
 * Initialize DuckDB WASM instance (singleton pattern)
 * @returns {Promise<{db: duckdb.AsyncDuckDB, connection: duckdb.AsyncDuckDBConnection}>}
 */
export async function initDuckDB() {
	if (dbInstance && connectionInstance) {
		return { db: dbInstance, connection: connectionInstance };
	}

	try {
		// Use manual bundle configuration for local development to avoid CORS issues
		const MANUAL_BUNDLES = {
			mvp: {
				mainModule: '/duckdb/duckdb-mvp.wasm',
				mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
			},
			eh: {
				mainModule: '/duckdb/duckdb-eh.wasm',
				mainWorker: '/duckdb/duckdb-browser-eh.worker.js',
			},
		};

		// Select appropriate bundle (prefer EH for better compatibility)
		const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

		// Create worker
		const worker = new Worker(bundle.mainWorker);

		// Instantiate DuckDB
		const logger = new duckdb.ConsoleLogger();
		const db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		// Create connection
		const connection = await db.connect();

		dbInstance = db;
		connectionInstance = connection;

		console.log("DuckDB initialized successfully");
		return { db, connection };
	} catch (error) {
		console.error("Failed to initialize DuckDB:", error);
		throw error;
	}
}

/**
 * Get the current DuckDB connection (initializes if needed)
 * @returns {Promise<duckdb.AsyncDuckDBConnection>}
 */
export async function getConnection() {
	if (!connectionInstance) {
		await initDuckDB();
	}
	return connectionInstance;
}

/** * Get DuckDB instance (singleton)
 * @returns {Promise<duckdb.AsyncDuckDB>}
 */
export async function getDB() {
	if (!dbInstance) {
		await initDuckDB();
	}
	return dbInstance;
}

/** * Reset DuckDB instance (for testing or cleanup)
 */
export async function resetDuckDB() {
	if (connectionInstance) {
		await connectionInstance.close();
		connectionInstance = null;
	}
	if (dbInstance) {
		await dbInstance.terminate();
		dbInstance = null;
	}
}
