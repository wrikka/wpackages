import type { BenchResult } from "../../types/index";
import { formatOps, formatTime } from "../stats-formatters";

export const formatJSON = (data: unknown, pretty: boolean = true): string => {
	return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
};

export const formatMarkdownTable = (
	results: readonly BenchResult[],
): string => {
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
