import { generateReport, PluginManager, runAbBenchmark } from "@wpackages/bench";
import type { ComparisonResult } from "@wpackages/bench";
import { mkdir } from "fs/promises";

type BenchCase = "small" | "medium" | "large";

type CaseResult = {
	readonly case: BenchCase;
	readonly result: ComparisonResult;
};

const CASES: readonly BenchCase[] = ["small", "medium", "large"];

const getArgValue = (key: string): string | undefined => {
	const i = process.argv.indexOf(key);
	if (i === -1) return undefined;
	return process.argv[i + 1];
};

const parseCaseArg = (): BenchCase | "all" => {
	const raw = getArgValue("--case") ?? "all";
	if (raw === "small" || raw === "medium" || raw === "large") return raw;
	return "all";
};

const parseNumberArg = (key: string, fallback: number): number => {
	const raw = getArgValue(key);
	if (!raw) return fallback;
	const n = Number.parseInt(raw, 10);
	return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const ensureDir = async (path: string): Promise<void> => {
	await mkdir(path, { recursive: true });
};

const createSummaryHtml = (results: readonly CaseResult[]): string => {
	const rows = results
		.map(({ case: c, result }) => {
			const sorted = [...result.results].sort((a, b) => a.mean - b.mean);
			const fastest = sorted[0];
			const slowest = sorted[sorted.length - 1];
			if (!fastest || !slowest) return "";

			const speedup = result.speedups[slowest.command] ?? 1;
			return `
				<tr>
					<td><code>${c}</code></td>
					<td><code>${result.fastest}</code></td>
					<td><code>${result.slowest}</code></td>
					<td>${speedup.toFixed(2)}x</td>
					<td>${fastest.mean.toFixed(2)} ms</td>
					<td>${slowest.mean.toFixed(2)} ms</td>
					<td><a href="result.${c}.html">Open report</a></td>
				</tr>
			`;
		})
		.join("");

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Webserver Benchmark Summary</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 2em; background-color: #f8f9fa; color: #212529; }
		h1 { color: #343a40; border-bottom: 2px solid #dee2e6; padding-bottom: 0.3em; }
		table { width: 100%; border-collapse: collapse; margin-top: 1.5em; background: #fff; border-radius: 8px; overflow: hidden; }
		th, td { padding: 0.8em; text-align: left; border-bottom: 1px solid #dee2e6; }
		th { background-color: #e9ecef; }
		code { background-color: #e9ecef; padding: 0.2em 0.4em; border-radius: 3px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
	</style>
</head>
<body>
	<h1>Webserver Benchmark Summary</h1>
	<p>Generated on: ${new Date().toUTCString()}</p>
	<div style="display:flex; gap:12px; flex-wrap: wrap; margin-top: 0.75em;">
		<a href="result.json" style="text-decoration:none; background:#343a40; color:#fff; padding:8px 10px; border-radius:6px;">result.json</a>
		<a href="result.small.html" style="text-decoration:none; background:#0d6efd; color:#fff; padding:8px 10px; border-radius:6px;">small</a>
		<a href="result.medium.html" style="text-decoration:none; background:#0d6efd; color:#fff; padding:8px 10px; border-radius:6px;">medium</a>
		<a href="result.large.html" style="text-decoration:none; background:#0d6efd; color:#fff; padding:8px 10px; border-radius:6px;">large</a>
	</div>
	<table>
		<thead>
			<tr>
				<th>Case</th>
				<th>Fastest</th>
				<th>Slowest</th>
				<th>Speedup (slowest/fastest)</th>
				<th>Fastest Mean</th>
				<th>Slowest Mean</th>
				<th>Report</th>
			</tr>
		</thead>
		<tbody>
			${rows}
		</tbody>
	</table>
</body>
</html>`;
};

const main = async (): Promise<void> => {
	await ensureDir("bench");

	const caseArg = parseCaseArg();
	const runs = parseNumberArg("--runs", 8);
	const warmup = parseNumberArg("--warmup", 2);
	const selectedCases = caseArg === "all" ? CASES : ([caseArg] as const);

	const pluginManager = new PluginManager();

	const caseResults: CaseResult[] = [];

	for (const c of selectedCases) {
		process.stdout.write(`\n=== case: ${c} (${caseResults.length + 1}/${selectedCases.length}) ===\n`);
		const cmdW = ["bun", "./bench/sample/wpackages.ts", "--case", c] as const;
		const cmdE = ["bun", "./bench/sample/elysia.ts", "--case", c] as const;

		const result = await runAbBenchmark(
			[cmdW, cmdE],
			{
				warmup,
				runs,
				concurrency: 1,
				shell: process.platform === "win32" ? "cmd" : "bash",
				silent: false,
				output: "table",
				ab: true,
			},
			pluginManager,
		);

		caseResults.push({ case: c, result });

		await generateReport(result, `bench/result.${c}.html`);
	}

	await Bun.write(
		"bench/result.json",
		JSON.stringify({ results: caseResults }, null, 2),
	);

	await Bun.write(
		"bench/result.html",
		createSummaryHtml(caseResults),
	);
};

await main();
