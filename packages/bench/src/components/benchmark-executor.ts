import { execa } from "execa";
import { runCommand } from "../lib/runner";
import type { BenchmarkOptions, BenchmarkResult } from "../types/index";
import { calculateStats } from "../lib/benchmark";

/**
 * Execute warmup runs to reduce cold start bias
 *
 * @param command - The command to warm up
 * @param options - Benchmark options including warmup count, prepare/cleanup commands, and shell
 *
 * @example
 * ```ts
 * await executeWarmup("npm run test", {
 *   warmup: 3,
 *   shell: "bash"
 * });
 * ```
 */
export const executeWarmup = async (
	command: string,
	options: BenchmarkOptions,
): Promise<void> => {
	const { warmup = 0, prepare, cleanup, shell = "bash", silent } = options;

	if (!silent && warmup > 0) {
		console.log(`Running ${warmup} warmup iteration(s)...`);
	}

	for (let i = 0; i < warmup; i++) {
		if (prepare) await execa(shell, ["-c", prepare]);
		await runCommand(command, shell);
		if (cleanup) await execa(shell, ["-c", cleanup]);
	}
};

/**
 * Execute benchmark runs and collect timing data
 *
 * @param command - The command to benchmark
 * @param options - Benchmark options including runs count, prepare/cleanup commands, and shell
 * @returns Array of execution times in milliseconds
 *
 * @example
 * ```ts
 * const times = await executeBenchmarkRuns("npm run test", {
 *   runs: 10,
 *   shell: "bash"
 * });
 * console.log(`Average: ${times.reduce((a, b) => a + b) / times.length}ms`);
 * ```
 */
export const executeBenchmarkRuns = async (
	command: string,
	options: BenchmarkOptions,
): Promise<number[]> => {
	const { runs = 10, prepare, cleanup, shell = "bash", silent, verbose } = options;

	if (!silent) {
		console.log(`Running ${runs} benchmark iteration(s)...`);
	}

	const times: number[] = [];

	for (let i = 0; i < runs; i++) {
		if (prepare) await execa(shell, ["-c", prepare]);
		const time = await runCommand(command, shell);
		times.push(time);
		if (cleanup) await execa(shell, ["-c", cleanup]);

		if (verbose) {
			console.log(`  Run ${i + 1}: ${time.toFixed(2)} ms`);
		}
	}

	return times;
};

/**
 * Execute complete benchmark (warmup + runs) and calculate statistics
 *
 * @param command - The command to benchmark
 * @param options - Complete benchmark options
 * @returns Benchmark result with calculated statistics
 *
 * @example
 * ```ts
 * const result = await executeBenchmark("npm run test", {
 *   warmup: 3,
 *   runs: 10,
 *   shell: "bash"
 * });
 * console.log(`Mean: ${result.mean}ms ± ${result.stddev}ms`);
 * ```
 */
export const executeBenchmark = async (
	command: string,
	options: BenchmarkOptions,
): Promise<BenchmarkResult> => {
	// Warmup phase
	await executeWarmup(command, options);

	// Benchmark runs
	const times = await executeBenchmarkRuns(command, options);

	// Calculate statistics
	return calculateStats(command, times);
};
