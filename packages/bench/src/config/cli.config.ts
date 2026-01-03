import { DEFAULT_RUNS, DEFAULT_SHELL, DEFAULT_WARMUP } from "../constant/cli.const";
import type { BenchConfigFile } from "../services/config-loader";
import type { BenchmarkOptions } from "../types/cli.types";

export const defaultBenchmarkOptions: BenchmarkOptions = {
	concurrency: 1,
	output: "text",
	runs: DEFAULT_RUNS,
	shell: DEFAULT_SHELL,
	silent: false,
	verbose: false,
	warmup: DEFAULT_WARMUP,
};

export const createBenchmarkConfig = (
	cliOptions: Partial<BenchmarkOptions> = {},
	configFile: Partial<BenchConfigFile> = {},
): BenchmarkOptions => ({
	...defaultBenchmarkOptions,
	...configFile,
	...cliOptions,
});
