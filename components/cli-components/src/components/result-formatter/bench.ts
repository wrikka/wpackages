import * as pc from "picocolors";
import type { BenchComparison, BenchResult, BenchSuite } from "../../types/index";
import { formatOps, formatPercentage, formatTime } from "../stats-formatters";

export const formatJSON = (data: unknown, pretty: boolean = true): string => {
	return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
};

export const formatMarkdownTable = (results: readonly BenchResult[]): string => {
	const lines: string[] = [];

	lines.push("| Name | Ops/sec | Average | Min | Max | StdDev |");
	lines.push("|------|---------|---------|-----|-----|--------|");

	for (const result of results) {
		lines.push(
			`| ${result.name} | ${formatOps(result.ops)} | ${formatTime(result.averageTime)} | ${
				formatTime(result.stats.min)
			} | ${formatTime(result.stats.max)} | ${formatTime(result.stats.standardDeviation)} |`,
		);
	}

	return lines.join("\n");
};

export const formatCSV = (results: readonly BenchResult[]): string => {
	const lines: string[] = [];

	lines.push(
		"Name,Iterations,Samples,Total Time (ms),Average (ms),Ops/sec,Min (ms),Max (ms),Median (ms),StdDev (ms),Variance,Margin of Error (ms),Relative Margin of Error (%)",
	);

	for (const result of results) {
		lines.push(
			[
				result.name,
				result.iterations,
				result.samples,
				result.totalTime,
				result.averageTime,
				result.ops,
				result.stats.min,
				result.stats.max,
				result.stats.median,
				result.stats.standardDeviation,
				result.stats.variance,
				result.stats.marginOfError,
				result.stats.relativeMarginOfError,
			].join(","),
		);
	}

	return lines.join("\n");
};

export const formatHTMLTable = (results: readonly BenchResult[]): string => {
	const rows = results
		.map(
			(result) => `
    <tr>
      <td>${result.name}</td>
      <td>${formatOps(result.ops)}</td>
      <td>${formatTime(result.averageTime)}</td>
      <td>${formatTime(result.stats.min)}</td>
      <td>${formatTime(result.stats.max)}</td>
      <td>${formatTime(result.stats.standardDeviation)}</td>
    </tr>`,
		)
		.join("");

	return `
<!DOCTYPE html>
<html>
<head>
  <title>Benchmark Results</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Benchmark Results</h1>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Ops/sec</th>
        <th>Average</th>
        <th>Min</th>
        <th>Max</th>
        <th>StdDev</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
};

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
