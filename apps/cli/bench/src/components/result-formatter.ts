import * as pc from "picocolors";
import type { BenchComparison, BenchResult, BenchSuite, ComparisonResult } from "../types/index";
import {
	formatBenchmarkResult as formatBenchmarkResultCli,
	formatBoxPlot,
	formatChart,
	formatComparison as formatComparisonCli,
	formatHistogram,
	formatTable,
} from "./formatters/cli";
import { formatCSV, formatHTMLTable, formatJSON, formatMarkdownTable } from "./formatters/data";
import { formatOps, formatPercentage, formatTime } from "./stats-formatters";

// Re-exporting for backward compatibility and centralized access
export {
	formatBenchmarkResult as formatBenchmarkResultCli,
	formatBoxPlot,
	formatChart,
	formatComparison as formatComparisonCli,
	formatHistogram,
	formatTable,
} from "./formatters/cli";
export { formatCSV, formatHTMLTable, formatJSON, formatMarkdownTable } from "./formatters/data";

export type ComparisonFormat = "default" | "table" | "json" | "chart" | "histogram" | "boxplot";

const formatterMap: Record<Exclude<ComparisonFormat, "default">, (comparison: ComparisonResult) => string> = {
	table: formatTable,
	json: (comp) => formatJSON(comp, true),
	chart: formatChart,
	histogram: formatHistogram,
	boxplot: formatBoxPlot,
} as const;

const selectFormatter = (format: ComparisonFormat): (comparison: ComparisonResult) => string => {
	if (format === "default") return formatComparisonCli;
	return formatterMap[format];
};

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
	const formatter = selectFormatter(format);
	return formatter(comparison);
};

// Backward compatible aliases
export const formatComparison = formatComparisonCli;
export const formatBenchmarkResult = formatBenchmarkResultCli;
export const formatJson = (data: unknown): string => formatJSON(data, true);

/**
 * Format benchmark result (bench-lib version)
 */
export const formatBenchResult = (result: BenchResult): string => {
	const lines: string[] = [];

	lines.push(pc.bold(result.name));
	lines.push(`  ${pc.dim("Iterations:")} ${result.iterations}`);
	lines.push(`  ${pc.dim("Samples:")} ${result.samples}`);
	lines.push(`  ${pc.dim("Total time:")} ${formatTime(result.totalTime)}`);
	lines.push(
		`  ${pc.dim("Average:")} ${formatTime(result.averageTime)} ${
			pc.dim(`±${formatPercentage(result.stats.relativeMarginOfError)}`)
		}`,
	);
	lines.push(`  ${pc.dim("Ops/sec:")} ${pc.cyan(formatOps(result.ops))}`);
	lines.push(
		`  ${pc.dim("Min:")} ${formatTime(result.stats.min)} ${pc.dim("|")} ${pc.dim("Max:")} ${
			formatTime(result.stats.max)
		}`,
	);
	lines.push(
		`  ${pc.dim("Median:")} ${formatTime(result.stats.median)} ${pc.dim("|")} ${pc.dim("StdDev:")} ${
			formatTime(result.stats.standardDeviation)
		}`,
	);

	return lines.join("\n");
};

/**
 * Format comparison (bench-lib version)
 */
export const formatBenchComparison = (comparison: BenchComparison): string => {
	const lines: string[] = [];

	lines.push(pc.bold("\nComparison:"));
	lines.push(`  🚀 Fastest: ${pc.green(comparison.fastest)}`);
	lines.push(`  🐌 Slowest: ${pc.red(comparison.slowest)}`);
	lines.push("");

	const sorted = [...comparison.results].sort((a, b) => a.relativeTo - b.relativeTo);

	for (const item of sorted) {
		const color = item.relativeTo === 1 ? pc.green : pc.yellow;
		const diff = item.percentage === 0
			? "baseline"
			: item.percentage > 0
			? `+${formatPercentage(item.percentage)}`
			: formatPercentage(item.percentage);

		lines.push(`  ${color(item.name)}: ${pc.dim(item.ratio)} ${pc.dim(`(${diff})`)}`);
	}

	return lines.join("\n");
};

/**
 * Format suite
 */
export const formatSuite = (suite: BenchSuite): string => {
	const lines: string[] = [];

	lines.push(pc.bold(pc.cyan(`\n${suite.name}`)));
	lines.push(pc.dim(`Created: ${suite.createdAt.toISOString().split("T")[0]}`));
	lines.push(pc.dim(`Total time: ${formatTime(suite.totalTime)}`));
	lines.push(pc.dim(`Benchmarks: ${suite.benchmarks.length}`));
	lines.push("");

	for (const bench of suite.benchmarks) {
		lines.push(formatBenchResult(bench));
		lines.push("");
	}

	return lines.join("\n");
};

// Alias for formatBenchmarkResultCli for clarity
export const formatBenchmarkResultCliVerbose = formatBenchmarkResultCli;
