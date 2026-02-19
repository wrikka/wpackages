import type { BenchComparison, BenchmarkResult, BenchResult, BenchSuite, ComparisonResult } from "../types/index";
import {
	formatBenchComparison as formatBenchComparisonBench,
	formatBenchResult as formatBenchResultBench,
	formatCSV as formatCSVBench,
	formatHTMLTable as formatHTMLTableBench,
	formatJSON as formatJSONBench,
	formatMarkdownTable as formatMarkdownTableBench,
	formatSuite as formatSuiteBench,
} from "./result-formatter/bench";
import {
	formatBenchmarkResult as formatBenchmarkResultCli,
	formatChart as formatChartCli,
	formatComparison as formatComparisonCli,
	formatJson as formatJsonCli,
	formatTable as formatTableCli,
} from "./result-formatter/cli";

/**
 * Format benchmark result (CLI version)
 */
export const formatBenchmarkResult = (result: BenchmarkResult): string => {
	return formatBenchmarkResultCli(result);
};

export const formatComparison = (comparison: ComparisonResult): string => {
	return formatComparisonCli(comparison);
};

export const formatTable = (comparison: ComparisonResult): string => {
	return formatTableCli(comparison);
};

export const formatJson = (comparison: ComparisonResult): string => {
	return formatJsonCli(comparison);
};

export const formatChart = (comparison: ComparisonResult): string => {
	return formatChartCli(comparison);
};

export type ComparisonFormat = "default" | "table" | "json" | "chart";

const comparisonFormatters: Record<Exclude<ComparisonFormat, "default">, (comparison: ComparisonResult) => string> = {
	table: formatTable,
	json: formatJson,
	chart: formatChart,
} as const;

/**
 * Master formatter for benchmark comparisons
 * @param comparison - The comparison result object
 * @param format - The desired output format
 * @returns The formatted string
 */
export const formatComparisonResult = (
	comparison: ComparisonResult,
	format: ComparisonFormat = "default",
): string => {
	if (format === "default") return formatComparison(comparison);
	return comparisonFormatters[format](comparison);
};

/**
 * Format benchmark result (bench-lib version)
 */
export const formatBenchResult = (result: BenchResult): string => {
	return formatBenchResultBench(result);
};

/**
 * Format comparison (bench-lib version)
 */
export const formatBenchComparison = (comparison: BenchComparison): string => {
	return formatBenchComparisonBench(comparison);
};

/**
 * Format suite
 */
export const formatSuite = (suite: BenchSuite): string => {
	return formatSuiteBench(suite);
};

/**
 * Format as JSON
 */
export const formatJSON = (data: unknown, pretty: boolean = true): string => {
	return formatJSONBench(data, pretty);
};

/**
 * Format as markdown table
 */
export const formatMarkdownTable = (
	results: readonly BenchResult[],
): string => {
	return formatMarkdownTableBench(results);
};

/**
 * Format as CSV
 */
export const formatCSV = (results: readonly BenchResult[]): string => {
	return formatCSVBench(results);
};

/**
 * Format as HTML table
 */
export const formatHTMLTable = (results: readonly BenchResult[]): string => {
	return formatHTMLTableBench(results);
};
