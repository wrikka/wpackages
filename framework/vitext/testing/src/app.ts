/**
 * Application composition and setup
 */

import { createConfig } from "./config";
import { runTests } from "./services";
import type { TestReport } from "./types";
import type { TestConfig } from "./config";

/**
 * Run test suite with configuration
 */
export const runTestSuite = async (
	config: Partial<TestConfig> = {},
): Promise<TestReport> => {
	const finalConfig = createConfig(config);

	if (finalConfig.verbose) {
		console.log("Running tests with config:", finalConfig);
	}

	const report = await runTests();

	if (finalConfig.verbose) {
		console.log("Test report:", report);
	}

	return report;
};

/**
 * Execute tests and exit with appropriate code
 */
export const executeTests = async (config: Partial<TestConfig> = {}): Promise<void> => {
	const report = await runTestSuite(config);

	if (!report.success) {
		process.exit(1);
	}

	process.exit(0);
};
