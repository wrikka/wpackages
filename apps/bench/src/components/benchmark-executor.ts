import { execa } from "execa";
import { calculateStats } from "../lib/benchmark";
import { runCommand, type RunResult } from "../lib/runner";
import { LiveConsole } from "../services/live-console.service";
import type { BenchmarkOptions, BenchmarkResult } from "../types/index";

const renderProgressBar = (value: number, max: number, color?: "red"): string => {
	const width = 30;
	const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
	const filled = Math.round(width * ratio);
	const bar = `${"█".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}`;
	const prefix = color === "red" ? "✗" : "";
	return `${prefix}[${bar}] ${value}/${max}`;
};

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
	let firstError: string | null = null;
	const parallel = Math.max(1, concurrency);

	for (let i = 0; i < runs; i++) {
		liveConsole?.render(renderProgressBar(i, runs));
		if (prepare) await execa(shell, ["-c", prepare]);

		try {
			const settled = await Promise.allSettled(
				Array.from({ length: parallel }, () => runCommand(command, shell)),
			);

			const successfulRuns = settled
				.filter((r): r is PromiseFulfilledResult<RunResult> => r.status === "fulfilled")
				.map(r => r.value);

			if (firstError === null) {
				const firstRejected = settled.find((r): r is PromiseRejectedResult => r.status === "rejected");
				if (firstRejected) {
					firstError = firstRejected.reason instanceof Error
						? firstRejected.reason.message
						: String(firstRejected.reason);
				}
			}

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
				liveConsole?.render(renderProgressBar(i + 1, runs, "red"));
			}
		} catch {
			errorCount += parallel;
			if (firstError === null) {
				firstError = "Unexpected error while running benchmark command";
			}
			if (verbose) {
				console.log(`  Run ${i + 1}: failed (${parallel}x)`);
			}
			liveConsole?.render(renderProgressBar(i + 1, runs, "red"));
		} finally {
			if (cleanup) await execa(shell, ["-c", cleanup]);
		}
	}

	liveConsole?.render(renderProgressBar(runs, runs));
	liveConsole?.clear();

	if (results.length === 0) {
		throw new Error(
			`All benchmark runs failed for '${command}' (${errorCount}/${runs * concurrency})${
				firstError ? `\n${firstError}` : ""
			}`,
		);
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
