import alasql from 'alasql';

let currentTable = null;

/**
 * Initialize AlaSQL (lightweight in-browser SQL database)
 * Safe alternative to DuckDB-WASM
 */
export async function initDuckDB() {
  // AlaSQL is ready to use immediately, no initialization needed
  console.log('AlaSQL initialized successfully');
  return { db: alasql, conn: alasql };
}

/**
 * Load data into AlaSQL table
 */
export async function loadDataIntoTable(tableName, data) {
  try {
    // Drop table if exists
    try {
      alasql(`DROP TABLE IF EXISTS ${tableName}`);
    } catch (e) {
      // Table might not exist, ignore
    }
    
    // Create table and insert data
    alasql(`CREATE TABLE ${tableName}`);
    alasql.tables[tableName].data = data;
    
    console.log(`Loaded ${data.length} rows into table ${tableName}`);
    currentTable = tableName;
    
    return true;
  } catch (error) {
    console.error('Failed to load data into AlaSQL:', error);
    throw error;
  }
}

/**
 * Execute SQL query
 */
export async function executeQuery(sql) {
  try {
    const result = alasql(sql);
    return Array.isArray(result) ? result : [result];
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
  const validFuncs = ['sum', 'avg', 'count', 'min', 'max'];
  
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
