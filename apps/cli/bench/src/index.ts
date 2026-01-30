/**
 * The main entry point for running benchmarks from the CLI or programmatically.
 */
export { runAbBenchmark, runBenchmark } from "./app";
export { PluginManager } from "./services/plugin.service";
export { generateReport } from "./services/report";

/**
 * Core types used for configuring and interpreting benchmark results.
 */
export type { BenchmarkOptions, BenchmarkResult, ComparisonResult } from "./types/index";

/**
 * CLI helpers
 */
export { ConsoleService } from "./services";
export { parseCliArgs } from "./utils";
