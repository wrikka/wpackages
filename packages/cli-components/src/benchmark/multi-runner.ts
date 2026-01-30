import { executeBenchmark } from "../components/benchmark-executor";
import { compareResults } from "../lib/benchmark";
import type { BenchmarkOptions, BenchmarkResult, ComparisonResult } from "../types/index";
import { exportResult } from "./exporter";
import { formatOutput } from "./output-formatter";

export async function runMultiBenchmark(
	commands: string[],
	options: BenchmarkOptions,
): Promise<ComparisonResult> {
	if (!options.silent) {
		console.log(`🔥 Benchmarking ${commands.length} commands...\n`);
	}

	const results: BenchmarkResult[] = [];
	for (const command of commands) {
		if (!options.silent) {
			console.log(`\nBenchmarking: ${command}`);
		}
		const result = await executeBenchmark(command, options);
		results.push(result);
	}

	const comparison = compareResults(results);

	if (!options.silent) {
		const output = options.output === "text" ? "comparison" : (options.output ?? "comparison");
		console.log(formatOutput(comparison, output));
	}

	if (options.export) {
		await exportResult(options.export, comparison, Boolean(options.silent));
	}

	return comparison;
}
