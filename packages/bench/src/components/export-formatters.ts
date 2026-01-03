import type { ComparisonResult } from "../types/index";

export const formatCsv = (result: ComparisonResult): string => {
	const header = ["Command", "Mean (ms)", "StdDev (ms)", "Min (ms)", "Max (ms)", "Runs"].join(",");
	const rows = result.results.map(r =>
		[r.command, r.mean.toFixed(2), r.stddev.toFixed(2), r.min.toFixed(2), r.max.toFixed(2), r.runs].join(",")
	);
	return [header, ...rows].join("\n");
};

export const formatMarkdown = (result: ComparisonResult): string => {
	const header = `| Command | Mean (ms) | StdDev (ms) | Min (ms) | Max (ms) | Runs |
|:---|---:|---:|---:|---:|---:|`;
	const rows = result.results.map(r =>
		`| ${r.command} | ${r.mean.toFixed(2)} | ${r.stddev.toFixed(2)} | ${r.min.toFixed(2)} | ${
			r.max.toFixed(2)
		} | ${r.runs} |`
	);
	return [header, ...rows].join("\n");
};
