/**
 * Manages the registration of test suites, individual tests, and hooks (`before`, `after`).
 * This class acts as a central store for all test-related metadata before execution.
 */

import type { TestFn, TestHook } from "../types";

export type RegisteredTest = {
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
	 * Get current suite name (for describe)
	 */
	getCurrentSuite(): string {
		return this.currentSuite;
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
 * A global singleton instance of the `TestRegistry`.
 * This instance is used by `describe`, `it`, `before`, and `after` to register tests and hooks.
 */
export const registry = new TestRegistry();

/**
 * Creates a new test suite.
 * @param name The name of the suite.
 * @param fn The function that contains the tests (`it` blocks) for this suite.
 */
export const describe = (name: string, fn: () => void): void => {
	const previousSuite = registry.getCurrentSuite();
	registry.setCurrentSuite(name);
	fn();
	registry.setCurrentSuite(previousSuite);
};

/**
 * Registers a new test case within the current suite.
 * @param name The name of the test case.
 * @param fn The function containing the test logic and assertions.
 */
export const test = (name: string, fn: TestFn): void => {
	registry.registerTest(name, fn);
};

/**
 * Registers a test case that will be exclusively run. All other tests will be skipped.
 * @param name The name of the test case.
 * @param fn The function containing the test logic and assertions.
 */
export const only = (name: string, fn: TestFn): void => {
	registry.registerTest(name, fn, { only: true });
};

/**
 * Alias for `test`.
 */
export const it = test;

/**
 * Registers a hook to be run once before all tests in the current context.
 * @param fn The hook function to execute.
 */
export const before = (fn: TestHook): void => {
	registry.registerBefore(fn);
};

/**
 * Registers a hook to be run once after all tests in the current context have completed.
 * @param fn The hook function to execute.
 */
export const after = (fn: TestHook): void => {
	registry.registerAfter(fn);
};

/**
 * Retrieves the global `TestRegistry` instance.
 * Primarily used for testing the test runner itself.
 * @returns The global `TestRegistry` instance.
 */
export const getRegistry = (): TestRegistry => registry;
