import { appendFile } from "fs/promises";
import type { BenchmarkPlugin, BenchmarkResult, ComparisonResult } from "../types";

const log = (message: string) => appendFile("benchmark.log", `[${new Date().toISOString()}] ${message}\n`);

const loggerPlugin: BenchmarkPlugin = {
	name: "Logger Plugin",
	version: "1.0.0",

	async onBenchmarkStart(commands) {
		await log(`Benchmark starting for commands: ${commands.join(", ")}`);
	},

	async onBenchmarkComplete(result: BenchmarkResult) {
		await log(`Benchmark complete for '${result.command}': ${result.mean.toFixed(2)}ms`);
	},

	async onComparisonComplete(results: ComparisonResult) {
		await log(`Comparison complete. Fastest: ${results.fastest}, Slowest: ${results.slowest}`);
	},

	async onError(error: Error) {
		await log(`ERROR: ${error.message}`);
	},
};

export default loggerPlugin;
