/**
 * The main entry point for running benchmarks from the CLI or programmatically.
 */
export { runAbBenchmark, runBenchmark } from "./app";

/**
 * Core types used for configuring and interpreting benchmark results.
 */
export type { BenchmarkOptions, BenchmarkResult, ComparisonResult } from "./types/index";

/**
 * CLI helpers
 */
export { ConsoleService } from "./services";
export { parseCliArgs } from "./utils";
