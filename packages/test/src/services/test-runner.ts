/**
 * Discovers, loads, and runs test suites.
 * This service orchestrates the entire test execution process, from finding test files
 * to collecting results into a final report.
 */

import { injectGlobals } from "../globals";
import type { TestMetadata, TestReport, TestStatus, TestSuite } from "../types";
import { findTestFiles } from "../utils";

import { createConfig } from "../config";
import type { TestConfig } from "../config";
import { registry } from "./registry";
import { executeTest } from "./test-executor";

/**
 * Discovers, loads, and executes all tests based on the provided configuration.
 * It generates a comprehensive report of the test run.
 * @param config A partial `TestConfig` object to override default settings.
 * @returns A promise that resolves to a `TestReport` summarizing the test run.
 */
export const runTests = async (config: Partial<TestConfig> = {}): Promise<TestReport> => {
	const finalConfig = createConfig(config);

	// Inject globals if enabled
	if (finalConfig.globals) {
		injectGlobals();
	}

	// Run setup files
	for (const file of finalConfig.setupFiles) {
		await import(file);
	}

	// Discover and load test files
	const testFiles = await findTestFiles(finalConfig.include, finalConfig.exclude);
	for (const file of testFiles) {
		await import(file);
	}

	const suites = registry.getSuites();
	const beforeHooks = registry.getBeforeHooks();
	const afterHooks = registry.getAfterHooks();
	const hasOnlyTests = registry.getHasOnlyTests();

	const testSuites: TestSuite[] = [];
	let totalTests = 0;
	let passedTests = 0;
	let failedTests = 0;
	let skippedTests = 0;
	const startTime = Date.now();

	for (const [suiteName, tests] of suites) {
		const suiteTests: TestMetadata[] = [];
		const suiteStartTime = Date.now();
		const selectedTests = hasOnlyTests ? tests.filter((t) => t.only) : tests;

		const results = finalConfig.parallel
			? await Promise.all(selectedTests.map((t) => executeTest(t, finalConfig, beforeHooks, afterHooks)))
			: await selectedTests.reduce<Promise<TestMetadata[]>>(async (accP, t) => {
				const acc = await accP;
				const r = await executeTest(t, finalConfig, beforeHooks, afterHooks);
				acc.push(r);
				return acc;
			}, Promise.resolve([]));

		suiteTests.push(...results);

		// Update counters
		for (const r of results) {
			totalTests++;
			if (r.status === "passed") passedTests++;
			if (r.status === "failed") failedTests++;
			if (r.status === "skipped") skippedTests++;
		}

		const suiteDuration = Date.now() - suiteStartTime;
		const suiteStatus: TestStatus = suiteTests.every((t) => t.status === "passed" || t.status === "skipped")
			? "passed"
			: "failed";

		testSuites.push({
			name: suiteName,
			tests: suiteTests,
			duration: suiteDuration,
			status: suiteStatus,
		});
	}

	const totalDuration = Date.now() - startTime;

	return {
		suites: testSuites,
		totalTests,
		passedTests,
		failedTests,
		skippedTests,
		duration: totalDuration,
		success: failedTests === 0,
	};
};
