import * as pc from "picocolors";
import { COLORS, SYMBOLS } from "../../constant/cli.const";
import type { BenchmarkResult, ComparisonResult } from "../../types/index";
import { formatTime } from "../stats-formatters";

const formatTableRow = (
	row: string[],
	widths: number[],
	isHeader = false,
): string => {
	const formatted = row.map((cell, i) => cell.padEnd(widths[i] || 0)).join(" ");
	return isHeader ? `${COLORS.bold(formatted)}\n` : `${formatted}\n`;
};

export const formatBenchmarkResult = (result: BenchmarkResult): string => {
	let output = `\n${pc.bold(result.command)}\n`;
	output += `${pc.dim("─".repeat(60))}\n`;
	output += `  Runs: ${result.runs}\n`;
	output += `  Mean: ${pc.cyan(formatTime(result.mean))} ± ${formatTime(result.stddev)}\n`;
	output += `  Median: ${formatTime(result.median)}\n`;
	output += `  Range: ${formatTime(result.min)} ... ${formatTime(result.max)}\n`;
	output += `  Percentiles:\n`;
	output += `    25th: ${formatTime(result.percentiles.p25)}\n`;
	output += `    50th: ${formatTime(result.percentiles.p50)}\n`;
	output += `    75th: ${formatTime(result.percentiles.p75)}\n`;
	output += `    90th: ${formatTime(result.percentiles.p90)}\n`;
	output += `    95th: ${formatTime(result.percentiles.p95)}\n`;
	output += `    99th: ${formatTime(result.percentiles.p99)}\n`;
	return output;
};

export const formatComparison = (comparison: ComparisonResult): string => {
	let output = `\n${COLORS.bold("Benchmark Comparison")}\n`;
	output += `${COLORS.dim("─".repeat(60))}\n\n`;

	const sorted = [...comparison.results].sort((a, b) => a.mean - b.mean);

	for (const result of sorted) {
		const speedup = comparison.speedups[result.command];
		const isFastest = result.command === comparison.fastest;
		const isSlowest = result.command === comparison.slowest;

		const symbol = isFastest
			? SYMBOLS.fastest
			: isSlowest
			? SYMBOLS.slowest
			: " ";
		const color = isFastest
			? COLORS.fastest
			: isSlowest
			? COLORS.slowest
			: COLORS.muted;

		output += `${symbol} ${color(result.command)}\n`;
		output += `  ${formatTime(result.mean)} ± ${formatTime(result.stddev)}`;

		if (!isFastest && speedup !== undefined) {
			output += ` ${COLORS.dim(`(${speedup.toFixed(2)}x slower)`)}`;
		} else {
			output += ` ${COLORS.success("(fastest)")}`;
		}

		output += "\n\n";
	}

	return output;
};

export const formatTable = (comparison: ComparisonResult): string => {
	const headers = ["Command", "Mean", "StdDev", "Min", "Max", "Speedup"];
	const colWidths = [30, 12, 12, 12, 12, 10];

	let output = "\n";
	output += formatTableRow(headers, colWidths, true);
	output += `${COLORS.dim("─".repeat(colWidths.reduce((a, b) => a + b, 0) + headers.length + 1))}\n`;

	const sorted = [...comparison.results].sort((a, b) => a.mean - b.mean);

	for (const result of sorted) {
		const speedup = comparison.speedups[result.command];
		const isFastest = result.command === comparison.fastest;

		const row = [
			result.command.substring(0, 28),
			formatTime(result.mean),
			formatTime(result.stddev),
			formatTime(result.min),
			formatTime(result.max),
			isFastest ? "baseline" : speedup !== undefined ? `${speedup.toFixed(2)}x` : "N/A",
		];

		output += formatTableRow(row, colWidths);
	}

	return output;
};

export const formatJson = (comparison: ComparisonResult): string => {
	return JSON.stringify(comparison, null, 2);
};

export const formatChart = (comparison: ComparisonResult): string => {
	const maxMean = Math.max(...comparison.results.map((r) => r.mean));
	const barWidth = 50;

	let output = `\n${pc.bold("Performance Chart")}\n`;
	output += `${pc.dim("─".repeat(60))}\n\n`;

	const sorted = [...comparison.results].sort((a, b) => a.mean - b.mean);

	for (const result of sorted) {
		const barLength = Math.round((result.mean / maxMean) * barWidth);
		const bar = "█".repeat(barLength);
		const isFastest = result.command === comparison.fastest;
		const color = isFastest ? pc.green : pc.blue;

		output += `${result.command}\n`;
		output += `${color(bar)} ${formatTime(result.mean)}\n\n`;
	}

	return output;
};
