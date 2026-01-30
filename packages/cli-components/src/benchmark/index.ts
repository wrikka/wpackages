import { createBenchmarkConfig } from "../config/index";
import type { BenchmarkOptions } from "../types/index";
import { runMultiBenchmark } from "./multi-runner";
import { runSingleBenchmark } from "./single-runner";

export const runBenchmark = async (
	commands: string[],
	partialOptions: Partial<BenchmarkOptions> = {},
) => {
	const options = createBenchmarkConfig(partialOptions);

	try {
		if (commands.length === 1) {
			return await runSingleBenchmark(commands[0]!, options);
		} else {
			return await runMultiBenchmark(commands, options);
		}
	} catch (error) {
		throw error instanceof Error ? error : new Error("Benchmark failed");
	}
};
