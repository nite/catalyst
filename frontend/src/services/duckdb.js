import * as duckdb from '@duckdb/duckdb-wasm';

let db = null;
let conn = null;

/**
 * Initialize DuckDB-WASM instance
 */
export async function initDuckDB() {
  if (db) return { db, conn };

  try {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: 'text/javascript',
      })
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    conn = await db.connect();
    
    console.log('DuckDB-WASM initialized successfully');
    
    return { db, conn };
  } catch (error) {
    console.error('Failed to initialize DuckDB:', error);
    throw error;
  }
}

/**
 * Load data into DuckDB table
 */
export async function loadDataIntoTable(tableName, data) {
  if (!conn) {
    await initDuckDB();
  }

  try {
    // Drop table if exists
    await conn.query(`DROP TABLE IF EXISTS ${tableName}`);
    
    // Insert data
    await db.registerFileText(`${tableName}.json`, JSON.stringify(data));
    await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tableName}.json')`);
    
    console.log(`Loaded ${data.length} rows into table ${tableName}`);
    
    return true;
  } catch (error) {
    console.error('Failed to load data into DuckDB:', error);
    throw error;
  }
}

/**
 * Execute SQL query
 */
export async function executeQuery(sql) {
  if (!conn) {
    await initDuckDB();
  }

  try {
    const result = await conn.query(sql);
    const rows = result.toArray().map(row => row.toJSON());
    return rows;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

/**
 * Filter data using SQL
 */
export async function filterData(tableName, filters = {}) {
  let sql = `SELECT * FROM ${tableName}`;
  const conditions = [];

  // Build WHERE clause with proper escaping
  for (const [column, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      // IN clause for arrays - escape strings properly
      const values = value.map(v => 
        typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
      ).join(',');
      conditions.push(`${column} IN (${values})`);
    } else if (typeof value === 'object' && value.min !== undefined) {
      // Range filter - numeric values only
      if (value.min !== null) conditions.push(`${column} >= ${value.min}`);
      if (value.max !== null) conditions.push(`${column} <= ${value.max}`);
    } else {
      // Exact match - escape strings
      const val = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
      conditions.push(`${column} = ${val}`);
    }
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  return executeQuery(sql);
}

/**
 * Aggregate data using SQL
 */
export async function aggregateData(tableName, spec) {
  const { groupBy, aggregations, limit } = spec;
  
  // Validate function names to prevent injection
  const validFuncs = ['sum', 'avg', 'count', 'min', 'max', 'std', 'median'];
  
  // Build SELECT clause
  const selectParts = [...groupBy];
  for (const [column, func] of Object.entries(aggregations)) {
    const funcLower = func.toLowerCase();
    if (!validFuncs.includes(funcLower)) {
      throw new Error(`Invalid aggregation function: ${func}`);
    }
    selectParts.push(`${funcLower.toUpperCase()}(${column}) as ${column}_${funcLower}`);
  }

  let sql = `SELECT ${selectParts.join(', ')} FROM ${tableName}`;
  
  if (groupBy.length > 0) {
    sql += ` GROUP BY ${groupBy.join(', ')}`;
  }
  
  if (limit && Number.isInteger(limit) && limit > 0) {
    sql += ` LIMIT ${limit}`;
  }

  return executeQuery(sql);
}

export default {
  initDuckDB,
  loadDataIntoTable,
  executeQuery,
  filterData,
  aggregateData,
};
