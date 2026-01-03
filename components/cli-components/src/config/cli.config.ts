import { DEFAULT_RUNS, DEFAULT_SHELL, DEFAULT_WARMUP } from "../constant/cli.const";
import type { BenchmarkOptions } from "../types/cli.types";

export const defaultBenchmarkOptions: BenchmarkOptions = {
	output: "text",
	runs: DEFAULT_RUNS,
	shell: DEFAULT_SHELL,
	silent: false,
	verbose: false,
	warmup: DEFAULT_WARMUP,
};

export const createBenchmarkConfig = (
	options: Partial<BenchmarkOptions> = {},
): BenchmarkOptions => ({
	...defaultBenchmarkOptions,
	...options,
});
