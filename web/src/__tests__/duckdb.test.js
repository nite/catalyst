import { describe, it, expect, beforeEach } from "vitest";
import initSqlJs from "sql.js";

// Test the SQL query logic that we use in the DuckDB integration
// Using sql.js (SQLite) as a lightweight alternative for testing
// The SQL syntax is compatible between SQLite and DuckDB for our use cases

describe("DuckDB SQL Query Logic (using sql.js for testing)", () => {
	let SQL;
	let db;

	beforeEach(async () => {
		if (!SQL) {
			SQL = await initSqlJs();
		}
		db = new SQL.Database();
	});

	it("should create and query a table with aggregation", () => {
		const testData = [
			{ id: 1, name: "Alice", age: 30, city: "New York" },
			{ id: 2, name: "Bob", age: 25, city: "San Francisco" },
			{ id: 3, name: "Charlie", age: 35, city: "Chicago" },
			{ id: 4, name: "David", age: 28, city: "New York" },
		];

		// Create table and insert data
		db.run(`
			CREATE TABLE test_table (
				id INTEGER,
				name TEXT,
				age INTEGER,
				city TEXT
			)
		`);

		for (const row of testData) {
			db.run(
				`INSERT INTO test_table VALUES (?, ?, ?, ?)`,
				[row.id, row.name, row.age, row.city],
			);
		}

		// Test aggregation query (like what we use for charts)
		const result = db.exec(`
			SELECT city, COUNT(*) as count, AVG(age) as avg_age
			FROM test_table
			GROUP BY city
			ORDER BY city
		`);

		expect(result).toHaveLength(1);
		expect(result[0].values).toHaveLength(3);

		const rows = result[0].values.map((row) => ({
			city: row[0],
			count: row[1],
			avg_age: row[2],
		}));

		const nyResult = rows.find((r) => r.city === "New York");
		expect(nyResult.count).toBe(2);
		expect(nyResult.avg_age).toBe(29);
	});

	it("should simulate chart data query for line/bar charts", () => {
		// Simulate dataset with multiple records per category
		db.run(`
			CREATE TABLE dataset (month TEXT, sales INTEGER, product TEXT)
		`);

		const data = [
			["2023-01", 100, "Product A"],
			["2023-01", 150, "Product B"],
			["2023-02", 120, "Product A"],
			["2023-02", 180, "Product B"],
			["2023-03", 140, "Product A"],
			["2023-03", 200, "Product B"],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?, ?)", row);
		}

		// Query like we do for line/bar charts with grouping
		const result = db.exec(`
			SELECT month, product, SUM(CAST(sales AS REAL)) as sales
			FROM dataset
			WHERE month IS NOT NULL AND sales IS NOT NULL
			GROUP BY month, product
			ORDER BY month
			LIMIT 500
		`);

		expect(result[0].values).toHaveLength(6);
		expect(result[0].values[0][0]).toBe("2023-01");
		expect(result[0].values[0][2]).toBe(100);
	});

	it("should simulate treemap aggregation query", () => {
		db.run(`
			CREATE TABLE dataset (category TEXT, value INTEGER)
		`);

		const data = [
			["Electronics", 5000],
			["Electronics", 3000],
			["Clothing", 2000],
			["Clothing", 1500],
			["Food", 4000],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?)", row);
		}

		// Treemap query: aggregate by category
		const result = db.exec(`
			SELECT category, SUM(CAST(value AS REAL)) as value
			FROM dataset
			WHERE category IS NOT NULL AND value IS NOT NULL
			GROUP BY category
			ORDER BY value DESC
			LIMIT 50
		`);

		expect(result[0].values).toHaveLength(3);
		expect(result[0].values[0][0]).toBe("Electronics");
		expect(result[0].values[0][1]).toBe(8000);
		expect(result[0].values[1][0]).toBe("Food");
		expect(result[0].values[1][1]).toBe(4000);
	});

	it("should handle scatter plot data queries", () => {
		db.run(`
			CREATE TABLE dataset (x_val INTEGER, y_val INTEGER, color_group TEXT)
		`);

		const data = [
			[10, 20, "Group A"],
			[15, 25, "Group A"],
			[20, 30, "Group B"],
			[25, 35, "Group B"],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?, ?)", row);
		}

		// Scatter plot query with color grouping
		const result = db.exec(`
			SELECT x_val, y_val, color_group
			FROM dataset
			WHERE x_val IS NOT NULL AND y_val IS NOT NULL
			LIMIT 400
		`);

		expect(result[0].values).toHaveLength(4);
		expect(result[0].values[0][2]).toBe("Group A");
	});

	it("should handle map/location aggregation queries", () => {
		db.run(`
			CREATE TABLE dataset (location TEXT, value INTEGER)
		`);

		const data = [
			["California", 100000],
			["California", 150000],
			["Texas", 80000],
			["New York", 120000],
			["New York", 110000],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?)", row);
		}

		// Map query: aggregate by location
		const result = db.exec(`
			SELECT location, SUM(CAST(value AS REAL)) as value
			FROM dataset
			WHERE location IS NOT NULL AND value IS NOT NULL
			GROUP BY location
			ORDER BY value DESC
			LIMIT 50
		`);

		expect(result[0].values).toHaveLength(3);
		expect(result[0].values[0][0]).toBe("California");
		expect(result[0].values[0][1]).toBe(250000);
	});

	it("should handle filtering with WHERE clauses", () => {
		db.run(`
			CREATE TABLE dataset (date TEXT, amount INTEGER, status TEXT)
		`);

		const data = [
			["2023-01-01", 100, "Active"],
			["2023-01-02", 200, "Active"],
			["2023-01-03", 150, "Inactive"],
			["2023-01-04", 300, "Active"],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?, ?)", row);
		}

		// Query with filter
		const result = db.exec(`
			SELECT *
			FROM dataset
			WHERE status = 'Active' AND amount > 150
			ORDER BY date
		`);

		expect(result[0].values).toHaveLength(2);
		expect(result[0].values[0][1]).toBe(200);
		expect(result[0].values[1][1]).toBe(300);
	});

	it("should get table schema information", () => {
		db.run(`
			CREATE TABLE test_table (
				id INTEGER,
				name TEXT,
				age INTEGER
			)
		`);

		const result = db.exec("PRAGMA table_info(test_table)");

		expect(result).toHaveLength(1);
		expect(result[0].values).toHaveLength(3);

		const columnNames = result[0].values.map((col) => col[1]);
		expect(columnNames).toContain("id");
		expect(columnNames).toContain("name");
		expect(columnNames).toContain("age");
	});

	it("should handle large result sets with LIMIT", () => {
		db.run(`
			CREATE TABLE dataset (id INTEGER, name TEXT, value INTEGER)
		`);

		// Insert 1000 rows
		for (let i = 0; i < 1000; i++) {
			db.run("INSERT INTO dataset VALUES (?, ?, ?)", [
				i,
				`Item ${i}`,
				i * 10,
			]);
		}

		// Query with limit (like we do for charts)
		const result = db.exec("SELECT * FROM dataset LIMIT 100");

		expect(result[0].values).toHaveLength(100);
		expect(result[0].values[0][0]).toBe(0);
		expect(result[0].values[99][0]).toBe(99);
	});

	it("should handle NULL values correctly", () => {
		db.run(`
			CREATE TABLE dataset (category TEXT, value INTEGER)
		`);

		const data = [
			["A", 100],
			["B", null],
			[null, 200],
			["C", 300],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?)", row);
		}

		// Query filtering out NULLs (like our chart queries)
		const result = db.exec(`
			SELECT category, SUM(CAST(value AS REAL)) as value
			FROM dataset
			WHERE category IS NOT NULL AND value IS NOT NULL
			GROUP BY category
		`);

		expect(result[0].values).toHaveLength(2);
		const resultMap = Object.fromEntries(result[0].values);
		expect(resultMap.A).toBe(100);
		expect(resultMap.C).toBe(300);
	});

	it("should validate the exact SQL queries used in DatasetViewer", () => {
		// Test the actual SQL pattern from our chart query generation
		db.run(`
			CREATE TABLE dataset (
				date TEXT,
				revenue REAL,
				category TEXT
			)
		`);

		const data = [
			["2023-01", 1000, "A"],
			["2023-01", 1500, "B"],
			["2023-02", 1200, "A"],
			["2023-02", 1800, "B"],
		];

		for (const row of data) {
			db.run("INSERT INTO dataset VALUES (?, ?, ?)", row);
		}

		// This matches our actual query pattern for bar/line charts with color
		const sql = `
			SELECT "date", "category", SUM(CAST("revenue" AS REAL)) as "revenue"
			FROM dataset
			WHERE "date" IS NOT NULL AND "revenue" IS NOT NULL
			GROUP BY "date", "category"
			ORDER BY "date", "category"
			LIMIT 500
		`;

		const result = db.exec(sql);

		expect(result[0].values).toHaveLength(4);
		// Verify the aggregation worked correctly
		const jan_a = result[0].values.find((r) => r[0] === "2023-01" && r[1] === "A");
		expect(jan_a[2]).toBe(1000);
	});
});
