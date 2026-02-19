import { executeBenchmark } from "../components/benchmark-executor";
import { formatBenchmarkResult } from "../components/index";
import type { BenchmarkOptions, BenchmarkResult } from "../types/index";
import { exportResult } from "./exporter";

export async function runSingleBenchmark(
	command: string,
	options: BenchmarkOptions,
): Promise<BenchmarkResult> {
	if (!options.silent) {
		console.log(`🔥 Benchmarking: ${command}\n`);
	}

	const result = await executeBenchmark(command, options);

	if (!options.silent) {
		console.log(formatBenchmarkResult(result));
	}

	if (options.export) {
		await exportResult(options.export, result, Boolean(options.silent));
	}

	return result;
}
