import { ProgressBar } from "@wpackages/cli-components";
import { execa } from "execa";
import { calculateStats } from "../lib/benchmark";
import { runCommand, type RunResult } from "../lib/runner";
import { LiveConsole } from "../services/live-console.service";
import type { BenchmarkOptions, BenchmarkResult } from "../types/index";

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
type BenchmarkRunData = {
	times: number[];
	totalCpuUserMs: number;
	totalCpuSystemMs: number;
	maxRssBytes: number;
	errorCount: number;
	requestedRuns: number;
};

export const executeBenchmarkRuns = async (
	command: string,
	options: BenchmarkOptions,
): Promise<BenchmarkRunData> => {
	const { runs = 10, concurrency = 1, prepare, cleanup, shell = "bash", silent, verbose } = options;
	const liveConsole = silent || verbose ? null : new LiveConsole();

	const results: RunResult[] = [];
	let errorCount = 0;
	const parallel = Math.max(1, concurrency);

	for (let i = 0; i < runs; i++) {
		liveConsole?.render(ProgressBar({ value: i, max: runs, labelPosition: "right" }));
		if (prepare) await execa(shell, ["-c", prepare]);

		try {
			const settled = await Promise.allSettled(
				Array.from({ length: parallel }, () => runCommand(command, shell)),
			);

			const successfulRuns = settled
				.filter((r): r is PromiseFulfilledResult<RunResult> => r.status === "fulfilled")
				.map(r => r.value);

			const batchErrors = settled.length - successfulRuns.length;
			errorCount += batchErrors;

			if (successfulRuns.length > 0) {
				successfulRuns.sort((a, b) => b.timeMs - a.timeMs);
				results.push(successfulRuns[0]!);
				if (verbose) {
					console.log(`  Run ${i + 1}: ${successfulRuns[0]!.timeMs.toFixed(2)} ms (${parallel}x)`);
				}
			} else {
				if (verbose) {
					console.log(`  Run ${i + 1}: failed (${parallel}x)`);
				}
				liveConsole?.render(ProgressBar({ value: i + 1, max: runs, labelPosition: "right", color: "red" }));
			}
		} catch {
			errorCount += parallel;
			if (verbose) {
				console.log(`  Run ${i + 1}: failed (${parallel}x)`);
			}
			liveConsole?.render(ProgressBar({ value: i + 1, max: runs, labelPosition: "right", color: "red" }));
		} finally {
			if (cleanup) await execa(shell, ["-c", cleanup]);
		}
	}

	liveConsole?.render(ProgressBar({ value: runs, max: runs, labelPosition: "right" }));
	liveConsole?.clear();

	if (results.length === 0) {
		throw new Error(`All benchmark runs failed (${errorCount}/${runs * concurrency})`);
	}

	return {
		times: results.map(r => r.timeMs),
		totalCpuUserMs: results.reduce((sum, r) => sum + r.cpuUserMs, 0),
		totalCpuSystemMs: results.reduce((sum, r) => sum + r.cpuSystemMs, 0),
		maxRssBytes: results.reduce((max, r) => Math.max(max, r.maxRssBytes), 0),
		errorCount,
		requestedRuns: runs,
	};
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
	const runData = await executeBenchmarkRuns(command, options);

	// Calculate statistics
	return calculateStats(command, runData.times, runData.errorCount, runData.requestedRuns, {
		cpuUserMicros: runData.totalCpuUserMs * 1000,
		cpuSystemMicros: runData.totalCpuSystemMs * 1000,
		maxRssBytes: runData.maxRssBytes,
		// fsReadBytes and fsWriteBytes are not collected per-process yet.
		fsReadBytes: 0,
		fsWriteBytes: 0,
	});
};
