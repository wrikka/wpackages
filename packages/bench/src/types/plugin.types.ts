import type { BenchmarkOptions, BenchmarkResult, ComparisonResult } from "./index";

export interface BenchmarkPlugin {
	name: string;
	version: string;

	/**
	 * Called once before any benchmarks are run.
	 */
	onBenchmarkStart?: (commands: string[], options: BenchmarkOptions) => void | Promise<void>;

	/**
	 * Called after a single benchmark command has completed.
	 */
	onBenchmarkComplete?: (result: BenchmarkResult) => void | Promise<void>;

	/**
	 * Called after all benchmark commands have completed and comparison is done.
	 */
	onComparisonComplete?: (results: ComparisonResult) => void | Promise<void>;

	/**
	 * Called when an error occurs during the benchmark process.
	 */
	onError?: (error: Error) => void | Promise<void>;
}
