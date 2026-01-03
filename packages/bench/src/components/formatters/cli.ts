import * as pc from "picocolors";
import { COLORS, SYMBOLS } from "../../constant/cli.const";
import type { BenchmarkResult, ComparisonResult } from "../../types/index";
import { formatBytes, formatOps, formatPercentage, formatTime } from "../stats-formatters";
import { formatTableRow, sortByMean } from "./helpers";

const SEPARATOR_WIDTH = 60;
const CHART_BAR_WIDTH = 50;

export const formatBenchmarkResult = (result: BenchmarkResult): string => {
	let output = `\n${pc.bold(result.command)}\n`;
	output += `${pc.dim("─".repeat(SEPARATOR_WIDTH))}\n`;
	output += `  Runs: ${result.runs}\n`;
	output += `  Throughput: ${pc.cyan(formatOps(result.throughputOpsPerSec))}\n`;
	output += `  Error rate: ${formatPercentage(result.errorRate)} (${result.errorCount}/${result.runs})\n`;
	output += `  CPU: ${formatTime(result.cpuUserMs)} user / ${formatTime(result.cpuSystemMs)} system\n`;
	output += `  Memory (max RSS): ${formatBytes(result.maxRssBytes)}\n`;
	output += `  FS I/O: ${formatBytes(result.fsReadBytes)} read / ${formatBytes(result.fsWriteBytes)} write\n`;
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
	output += `${COLORS.dim("─".repeat(SEPARATOR_WIDTH))}\n\n`;

	const sorted = sortByMean(comparison);

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
		output += `  ${formatTime(result.mean)} ± ${formatTime(result.stddev)}\n`;
		output += `    ${pc.dim(`CPU: ${formatTime(result.cpuUserMs)} user, Mem: ${formatBytes(result.maxRssBytes)}`)}`;

		if (!isFastest && speedup !== undefined) {
			output += ` ${COLORS.dim(`(${speedup.toFixed(2)}x slower)`)}`;
			const pValue = comparison.pValues?.[result.command];
			if (pValue !== undefined && pValue < 0.05) {
				output += ` ${pc.italic(pc.gray("(statistically significant)"))}`;
			}
		} else {
			output += ` ${COLORS.success("(fastest)")}`;
		}

		output += "\n\n";
	}

	return output;
};

export const formatTable = (comparison: ComparisonResult): string => {
	const headers = ["Command", "Mean", "StdDev", "Max RSS", "p-value", "Speedup"];
	const colWidths = [30, 12, 12, 12, 10, 10] as const;

	let output = "\n";
	output += formatTableRow(headers, colWidths, true);
	output += `${COLORS.dim("─".repeat(colWidths.reduce((a, b) => a + b, 0) + headers.length - 1))}\n`;

	const sorted = sortByMean(comparison);

	for (const result of sorted) {
		const speedup = comparison.speedups[result.command];
		const isFastest = result.command === comparison.fastest;

		const row = [
			result.command.substring(0, 28),
			formatTime(result.mean),
			formatTime(result.stddev),
			formatBytes(result.maxRssBytes),
			isFastest ? "-" : comparison.pValues?.[result.command]?.toFixed(3) ?? "N/A",
			isFastest ? "baseline" : speedup !== undefined ? `${speedup.toFixed(2)}x` : "N/A",
		];

		output += formatTableRow(row, colWidths);
	}

	return output;
};

export const formatHistogram = (comparison: ComparisonResult): string => {
	let output = `\n${pc.bold("Time Distribution Histogram")}\n`;
	output += `${pc.dim("─".repeat(SEPARATOR_WIDTH))}\n\n`;

	for (const result of comparison.results) {
		output += `${pc.bold(result.command)}\n`;
		const times = result.times;
		const min = Math.min(...times);
		const max = Math.max(...times);
		const numBins = 10;
		const binWidth = (max - min) / numBins;
		const bins = Array(numBins).fill(0);

		for (const time of times) {
			let binIndex = Math.floor((time - min) / binWidth);
			if (binIndex === numBins) binIndex--; // Include max value in the last bin
			bins[binIndex]++;
		}

		const maxFreq = Math.max(...bins);
		const maxBarWidth = 40;

		bins.forEach((freq, i) => {
			const binStart = min + i * binWidth;
			const barLength = maxFreq > 0 ? Math.round((freq / maxFreq) * maxBarWidth) : 0;
			const bar = "█".repeat(barLength);
			output += `  ${formatTime(binStart).padEnd(10)} | ${pc.cyan(bar)} ${freq}\n`;
		});
		output += "\n";
	}
	return output;
};

export const formatBoxPlot = (comparison: ComparisonResult): string => {
	let output = `\n${pc.bold("Time Distribution Box Plot")}\n`;
	output += `${pc.dim("─".repeat(SEPARATOR_WIDTH))}\n\n`;

	for (const result of comparison.results) {
		output += `${pc.bold(result.command)}\n`;
		const { min, max } = result;
		const { p25, p50: median, p75 } = result.percentiles;
		const totalWidth = 50;
		const range = max - min;

		if (range === 0) {
			output += `  [${formatTime(min)}] (All values are the same)\n\n`;
			continue;
		}

		const scale = (val: number) => Math.floor(((val - min) / range) * totalWidth);

		const minPos = scale(min);
		const p25Pos = scale(p25);
		const medianPos = scale(median);
		const p75Pos = scale(p75);
		const maxPos = scale(max);

		let plot = " ".repeat(totalWidth + 1);
		const plotArr = plot.split("");

		// Whiskers
		for (let i = minPos; i <= p25Pos; i++) plotArr[i] = "-";
		for (let i = p75Pos; i <= maxPos; i++) plotArr[i] = "-";

		// Box
		for (let i = p25Pos; i <= p75Pos; i++) plotArr[i] = "█";

		// Markers
		plotArr[minPos] = "|";
		plotArr[p25Pos] = "[";
		plotArr[medianPos] = "|";
		plotArr[p75Pos] = "]";
		plotArr[maxPos] = "|";

		output += `  ${pc.cyan(plotArr.join(""))}\n`;
		output += `  Min: ${formatTime(min)}, P25: ${formatTime(p25)}, Med: ${formatTime(median)}, P75: ${formatTime(p75)}, Max: ${formatTime(max)}\n\n`;
	}

	return output;
};

export const formatChart = (comparison: ComparisonResult): string => {
	const maxMean = Math.max(...comparison.results.map((r) => r.mean));

	let output = `\n${pc.bold("Performance Chart")}\n`;
	output += `${pc.dim("─".repeat(SEPARATOR_WIDTH))}\n\n`;

	const sorted = sortByMean(comparison);

	for (const result of sorted) {
		const barLength = Math.round((result.mean / maxMean) * CHART_BAR_WIDTH);
		const bar = "█".repeat(barLength);
		const isFastest = result.command === comparison.fastest;
		const color = isFastest ? pc.green : pc.blue;

		output += `${result.command}\n`;
		output += `${color(bar)} ${formatTime(result.mean)}\n\n`;
	}

	return output;
};
