import { describe, it, expect } from 'vitest';
import {
	buildWhereClause,
	buildAggregationQuery,
	buildAggregationFunction,
	buildSelectQuery,
	buildDistinctValuesQuery,
	buildColumnStatsQuery,
} from './utils/sqlBuilder';

describe('sqlBuilder', () => {
	describe('buildWhereClause', () => {
		it('should return empty string for no filters', () => {
			const result = buildWhereClause({}, []);
			expect(result).toBe('');
		});

		it('should build range filter', () => {
			const filters = { year: { min: 2010, max: 2020 } };
			const filterConfigs = [
				{ column: 'year', filter_type: 'range' },
			];
			const result = buildWhereClause(filters, filterConfigs);
			expect(result).toBe('"year" BETWEEN 2010 AND 2020');
		});

		it('should build multi-select filter', () => {
			const filters = { country: ['USA', 'Canada'] };
			const filterConfigs = [
				{ column: 'country', filter_type: 'multi_select' },
			];
			const result = buildWhereClause(filters, filterConfigs);
			expect(result).toBe('"country" IN (\'USA\', \'Canada\')');
		});

		it('should combine multiple filters with AND', () => {
			const filters = {
				year: { min: 2010, max: 2020 },
				country: ['USA'],
			};
			const filterConfigs = [
				{ column: 'year', filter_type: 'range' },
				{ column: 'country', filter_type: 'multi_select' },
			];
			const result = buildWhereClause(filters, filterConfigs);
			expect(result).toContain('"year" BETWEEN 2010 AND 2020');
			expect(result).toContain('"country" IN (\'USA\')');
			expect(result).toContain(' AND ');
		});

		it('should escape single quotes in values', () => {
			const filters = { name: ["O'Brien"] };
			const filterConfigs = [
				{ column: 'name', filter_type: 'multi_select' },
			];
			const result = buildWhereClause(filters, filterConfigs);
			expect(result).toBe('"name" IN (\'O\'\'Brien\')');
		});
	});

	describe('buildAggregationFunction', () => {
		it('should build SUM aggregation', () => {
			const result = buildAggregationFunction('SUM', 'value');
			expect(result).toBe('SUM("value")');
		});

		it('should build AVG aggregation', () => {
			const result = buildAggregationFunction('AVG', 'value');
			expect(result).toBe('AVG("value")');
		});

		it('should build COUNT aggregation', () => {
			const result = buildAggregationFunction('COUNT', 'value');
			expect(result).toBe('COUNT(*)');
		});

		it('should build MEDIAN aggregation', () => {
			const result = buildAggregationFunction('MEDIAN', 'value');
			expect(result).toBe('percentile_cont(0.5) WITHIN GROUP (ORDER BY "value")');
		});

		it('should build STDDEV aggregation', () => {
			const result = buildAggregationFunction('STDDEV', 'value');
			expect(result).toBe('STDDEV("value")');
		});

		it('should build percentile aggregations', () => {
			expect(buildAggregationFunction('P25', 'value')).toBe(
				'percentile_cont(0.25) WITHIN GROUP (ORDER BY "value")'
			);
			expect(buildAggregationFunction('P75', 'value')).toBe(
				'percentile_cont(0.75) WITHIN GROUP (ORDER BY "value")'
			);
			expect(buildAggregationFunction('P90', 'value')).toBe(
				'percentile_cont(0.90) WITHIN GROUP (ORDER BY "value")'
			);
		});

		it('should handle custom SQL expressions', () => {
			const custom = 'SUM(price * volume) / SUM(volume)';
			const result = buildAggregationFunction(custom, 'value');
			expect(result).toBe(custom);
		});

		it('should replace {column} placeholder in custom expressions', () => {
			const custom = 'AVG({column} * 2)';
			const result = buildAggregationFunction(custom, 'value');
			expect(result).toBe('AVG("value" * 2)');
		});
	});

	describe('buildAggregationQuery', () => {
		it('should build simple aggregation query without grouping', () => {
			const chartConfig = {
				x_axis: 'year',
				y_axis: 'value',
				aggregation: 'SUM',
			};
			const result = buildAggregationQuery(chartConfig, {}, []);
			expect(result).toContain('SELECT "year" as x_label');
			expect(result).toContain('SUM("value") as y_value');
			expect(result).toContain('FROM {table}');
			expect(result).toContain('GROUP BY "year"');
			expect(result).toContain('ORDER BY "year"');
			expect(result).toContain('LIMIT 1000');
		});

		it('should build aggregation query with color_by grouping', () => {
			const chartConfig = {
				x_axis: 'year',
				y_axis: 'value',
				color_by: 'country',
				aggregation: 'AVG',
			};
			const result = buildAggregationQuery(chartConfig, {}, []);
			expect(result).toContain('"country" as group_by');
			expect(result).toContain('AVG("value") as y_value');
			expect(result).toContain('GROUP BY "year", "country"');
		});

		it('should include WHERE clause when filters present', () => {
			const chartConfig = {
				x_axis: 'year',
				y_axis: 'value',
				aggregation: 'SUM',
			};
			const filters = { year: { min: 2010, max: 2020 } };
			const filterConfigs = [
				{ column: 'year', filter_type: 'range' },
			];
			const result = buildAggregationQuery(chartConfig, filters, filterConfigs);
			expect(result).toContain('WHERE "year" BETWEEN 2010 AND 2020');
		});

		it('should handle array x_axis and y_axis', () => {
			const chartConfig = {
				x_axis: ['year'],
				y_axis: ['value'],
				color_by: ['country'],
				aggregation: 'COUNT',
			};
			const result = buildAggregationQuery(chartConfig, {}, []);
			expect(result).toContain('"year" as x_label');
			expect(result).toContain('"country" as group_by');
			expect(result).toContain('COUNT(*) as y_value');
		});
	});

	describe('buildSelectQuery', () => {
		it('should build simple SELECT query', () => {
			const result = buildSelectQuery({}, []);
			expect(result).toBe('SELECT * FROM {table} LIMIT 1000');
		});

		it('should include WHERE clause with filters', () => {
			const filters = { year: { min: 2010, max: 2020 } };
			const filterConfigs = [
				{ column: 'year', filter_type: 'range' },
			];
			const result = buildSelectQuery(filters, filterConfigs);
			expect(result).toContain('WHERE "year" BETWEEN 2010 AND 2020');
		});

		it('should respect custom limit', () => {
			const result = buildSelectQuery({}, [], 500);
			expect(result).toContain('LIMIT 500');
		});
	});

	describe('buildDistinctValuesQuery', () => {
		it('should build DISTINCT query for column', () => {
			const result = buildDistinctValuesQuery('country');
			expect(result).toBe(
				'SELECT DISTINCT "country" as value FROM {table} WHERE "country" IS NOT NULL ORDER BY "country" LIMIT 1000'
			);
		});

		it('should respect custom limit', () => {
			const result = buildDistinctValuesQuery('country', 100);
			expect(result).toContain('LIMIT 100');
		});
	});

	describe('buildColumnStatsQuery', () => {
		it('should build stats query for column', () => {
			const result = buildColumnStatsQuery('value');
			expect(result).toContain('MIN("value") as min');
			expect(result).toContain('MAX("value") as max');
			expect(result).toContain('COUNT(DISTINCT "value") as unique_count');
			expect(result).toContain('COUNT(*) as total_count');
			expect(result).toContain('WHERE "value" IS NOT NULL');
		});
	});
});
