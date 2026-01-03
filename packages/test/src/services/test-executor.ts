/**
 * Handles the execution of a single test case, including running `before` and `after` hooks.
 */

import type { TestConfig } from "../config";
import type { TestHook, TestMetadata, TestStatus } from "../types";
import { withTimeout } from "../utils";
import type { RegisteredTest } from "./registry";

/**
 * Executes a single test function and its associated hooks.
 * @param registered The registered test object to execute.
 * @param config The test configuration.
 * @param beforeHooks An array of `before` hooks to run before the test.
 * @param afterHooks An array of `after` hooks to run after the test.
 * @returns A promise that resolves to the `TestMetadata` for the executed test.
 */
export const executeTest = async (
	registered: RegisteredTest,
	config: TestConfig,
	beforeHooks: TestHook[],
	afterHooks: TestHook[],
): Promise<TestMetadata> => {
	const testStartTime = Date.now();
	let status: TestStatus = "pending";
	let testError: Error | undefined;
	let hookError: Error | undefined;
	let shouldSkip = false;

	try {
		// Run before hooks
		for (const hook of beforeHooks) {
			await hook();
		}
	} catch (err) {
		status = "failed";
		hookError = err instanceof Error ? err : new Error(String(err));
	}

	const context = {
		name: registered.name,
		skip: () => {
			shouldSkip = true;
		},
		only: () => {
			// If called during execution, it doesn't affect current run.
		},
	};

	// Only run test if before hooks passed
	if (status === "pending") {
		const attempt = async (): Promise<void> => {
			await withTimeout(Promise.resolve(registered.fn(context)), config.timeout);
		};

		try {
			for (let i = 0; i <= config.retries; i++) {
				try {
					await attempt();
					status = "passed";
					break;
				} catch (err) {
					if (i === config.retries) {
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
	}

	// Run after hooks
	try {
		for (const hook of afterHooks) {
			await hook();
		}
	} catch (err) {
		if (status !== "failed") {
			status = "failed";
		}
		hookError = err instanceof Error ? err : new Error(String(err));
	}

	const duration = Date.now() - testStartTime;

	const result: TestMetadata = {
		name: registered.name,
		duration,
		status,
		assertions: [],
	};

	if (testError) {
		result.error = testError;
	}
	if (hookError) {
		result.hookError = hookError;
	}

	return result;
};
