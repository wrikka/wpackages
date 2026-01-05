/**
 * The main entry point for running benchmarks from the CLI or programmatically.
 */
export { runBenchmark } from "./app";

/**
 * Core types used for configuring and interpreting benchmark results.
 */
export type { BenchmarkOptions, BenchmarkResult, ComparisonResult, Percentiles, Statistics } from "./types/index";

export type { CommandDef, OptionDef, ProgramDef } from "./types/index";

/**
 * CLI helpers
 */
export { ConsoleService, ConsoleServiceLive } from "./services/console.service";
export { parseCliArgs } from "./utils/cli-parser";

/**
 * Display components
 */
export * from "./components/display";

export { generateCommandHelp, generateProgramHelp } from "./components/help";

/**
 * Input components
 */
export * from "./components/input";
