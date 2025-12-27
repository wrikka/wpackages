/**
 * Test runner service - Effect-based test execution
 */

import type {
	TestFn,
	TestHook,
	TestMetadata,
	TestSuite,
	TestStatus,
	TestReport,
} from "../types";

/**
 * Test registry
 */
class TestRegistry {
	private tests: Map<string, TestFn> = new Map();
	private suites: Map<string, TestFn[]> = new Map();
	private beforeHooks: TestHook[] = [];
	private afterHooks: TestHook[] = [];
	private currentSuite: string = "default";

	/**
	 * Register test
	 */
	registerTest(name: string, fn: TestFn): void {
		const key = `${this.currentSuite}:${name}`;
		this.tests.set(key, fn);

		if (!this.suites.has(this.currentSuite)) {
			this.suites.set(this.currentSuite, []);
		}
		this.suites.get(this.currentSuite)!.push(fn);
	}

	/**
	 * Register before hook
	 */
	registerBefore(fn: TestHook): void {
		this.beforeHooks.push(fn);
	}

	/**
	 * Register after hook
	 */
	registerAfter(fn: TestHook): void {
		this.afterHooks.push(fn);
	}

	/**
	 * Get all tests
	 */
	getTests(): Map<string, TestFn> {
		return this.tests;
	}

	/**
	 * Get suites
	 */
	getSuites(): Map<string, TestFn[]> {
		return this.suites;
	}

	/**
	 * Get before hooks
	 */
	getBeforeHooks(): TestHook[] {
		return this.beforeHooks;
	}

	/**
	 * Get after hooks
	 */
	getAfterHooks(): TestHook[] {
		return this.afterHooks;
	}

	/**
	 * Set current suite
	 */
	setCurrentSuite(name: string): void {
		this.currentSuite = name;
	}

	/**
	 * Clear registry
	 */
	clear(): void {
		this.tests.clear();
		this.suites.clear();
		this.beforeHooks = [];
		this.afterHooks = [];
		this.currentSuite = "default";
	}
}

/**
 * Global test registry
 */
const registry = new TestRegistry();

/**
 * Describe - group tests
 */
export const describe = (name: string, fn: () => void): void => {
	const previousSuite = registry["currentSuite"];
	registry.setCurrentSuite(name);
	fn();
	registry.setCurrentSuite(previousSuite);
};

/**
 * Test - register test
 */
export const test = (name: string, fn: TestFn): void => {
	registry.registerTest(name, fn);
};

/**
 * It - alias for test
 */
export const it = test;

/**
 * Before hook
 */
export const before = (fn: TestHook): void => {
	registry.registerBefore(fn);
};

/**
 * After hook
 */
export const after = (fn: TestHook): void => {
	registry.registerAfter(fn);
};

/**
 * Run tests
 */
export const runTests = async (): Promise<TestReport> => {
	const suites = registry.getSuites();
	const beforeHooks = registry.getBeforeHooks();
	const afterHooks = registry.getAfterHooks();

	const testSuites: TestSuite[] = [];
	let totalTests = 0;
	let passedTests = 0;
	let failedTests = 0;
	let skippedTests = 0;
	const startTime = Date.now();

	for (const [suiteName, tests] of suites) {
		const suiteTests: TestMetadata[] = [];
		const suiteStartTime = Date.now();

		for (const test of tests) {
			// Run before hooks
			for (const hook of beforeHooks) {
				try {
					await hook();
				} catch (err) {
					console.error("Before hook failed:", err);
				}
			}

			const testStartTime = Date.now();
			let status: TestStatus = "passed";
			let testError: Error | undefined;
			let shouldSkip = false;

			try {
				await test({
					name: suiteName,
					skip: () => {
						shouldSkip = true;
					},
					only: () => {
						// Implementation for .only
					},
				});
				if (shouldSkip) {
					status = "skipped";
				}
			} catch (err) {
				status = "failed";
				testError = err instanceof Error ? err : new Error(String(err));
			}

			const duration = Date.now() - testStartTime;

			suiteTests.push({
				name: suiteName,
				duration,
				status,
				error: testError,
				assertions: [],
			});

			// Update counters
			totalTests++;
			if (status === "passed") passedTests++;
			if (status === "failed") failedTests++;
			if (status === "skipped") skippedTests++;

			// Run after hooks
			for (const hook of afterHooks) {
				try {
					await hook();
				} catch (err) {
					console.error("After hook failed:", err);
				}
			}
		}

		const suiteDuration = Date.now() - suiteStartTime;
		const suiteStatus: TestStatus =
			suiteTests.every((t) => t.status === "passed" || t.status === "skipped")
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

/**
 * Get registry for testing
 */
export const getRegistry = (): TestRegistry => registry;
