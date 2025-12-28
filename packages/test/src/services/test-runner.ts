/**
 * Test runner service - Effect-based test execution
 */

import type { TestFn, TestHook, TestMetadata, TestReport, TestStatus, TestSuite } from "../types";
import { withTimeout } from "../utils";

import { createConfig } from "../config";
import type { TestConfig } from "../config";

type RegisteredTest = {
	name: string;
	fn: TestFn;
	only: boolean;
};

/**
 * Test registry
 */
class TestRegistry {
	private tests: Map<string, RegisteredTest> = new Map();
	private suites: Map<string, RegisteredTest[]> = new Map();
	private beforeHooks: TestHook[] = [];
	private afterHooks: TestHook[] = [];
	private currentSuite: string = "default";
	private hasOnlyTests: boolean = false;

	/**
	 * Register test
	 */
	registerTest(name: string, fn: TestFn, options?: { only?: boolean }): void {
		const key = `${this.currentSuite}:${name}`;
		const entry: RegisteredTest = {
			name,
			fn,
			only: options?.only ?? false,
		};
		this.tests.set(key, entry);

		if (entry.only) {
			this.hasOnlyTests = true;
		}

		if (!this.suites.has(this.currentSuite)) {
			this.suites.set(this.currentSuite, []);
		}
		this.suites.get(this.currentSuite)!.push(entry);
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
	getTests(): Map<string, RegisteredTest> {
		return this.tests;
	}

	/**
	 * Get suites
	 */
	getSuites(): Map<string, RegisteredTest[]> {
		return this.suites;
	}

	getHasOnlyTests(): boolean {
		return this.hasOnlyTests;
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
		this.hasOnlyTests = false;
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

export const only = (name: string, fn: TestFn): void => {
	registry.registerTest(name, fn, { only: true });
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
export const runTests = async (config: Partial<TestConfig> = {}): Promise<TestReport> => {
	const finalConfig = createConfig(config);
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

		const runOne = async (registered: RegisteredTest): Promise<TestMetadata> => {
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

			const context = {
				name: registered.name,
				skip: () => {
					shouldSkip = true;
				},
				only: () => {
					// If called during execution, it doesn't affect current run.
				},
			};

			const attempt = async (): Promise<void> => {
				await withTimeout(Promise.resolve(registered.fn(context)), finalConfig.timeout);
			};

			try {
				for (let i = 0; i <= finalConfig.retries; i++) {
					try {
						await attempt();
						break;
					} catch (err) {
						if (i === finalConfig.retries) {
							throw err;
						}
					}
				}

				if (shouldSkip) {
					status = "skipped";
				}
			} catch (err) {
				status = "failed";
				testError = err instanceof Error ? err : new Error(String(err));
			}

			const duration = Date.now() - testStartTime;

			// Run after hooks
			for (const hook of afterHooks) {
				try {
					await hook();
				} catch (err) {
					console.error("After hook failed:", err);
				}
			}

			return {
				name: registered.name,
				duration,
				status,
				error: testError,
				assertions: [],
			};
		};

		const results = finalConfig.parallel
			? await Promise.all(selectedTests.map(runOne))
			: await selectedTests.reduce<Promise<TestMetadata[]>>(async (accP, t) => {
				const acc = await accP;
				const r = await runOne(t);
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

/**
 * Get registry for testing
 */
export const getRegistry = (): TestRegistry => registry;
