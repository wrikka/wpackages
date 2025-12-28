/**
 * @wts/test - Type-safe, functional testing framework
 *
 * A unified testing framework for unit and E2E testing with:
 * - Fluent assertion API
 * - Type-safe test runner
 * - Functional programming approach
 * - Vitest integration
 */

// Core types
export type {
	AssertionOptions,
	AssertionResult,
	CustomMatcher,
	MatcherResult,
	SnapshotOptions,
	TestContext,
	TestFn,
	TestHook,
	TestMetadata,
	TestReport,
	TestStatus,
	TestSuite,
} from "./types";

// Configuration
export type { TestConfig } from "./config";
export { createConfig, defaultConfig } from "./config";

// Constants
export { DEFAULT_PARALLEL, DEFAULT_RETRIES, DEFAULT_TIMEOUT, ERROR_MESSAGES, TEST_STATUS } from "./constant";

// Pure components (assertions)
export { Assertion, AssertionError, expect } from "./components";

// Utilities
export {
	arrayLengthMatcher,
	batch,
	clearSnapshots,
	createMatcher,
	createMock,
	deepEqualMatcher,
	delay,
	getAllSnapshots,
	getSnapshot,
	matchSnapshot,
	patternMatcher,
	race,
	rangeMatcher,
	restore,
	retry,
	sequential,
	spyOn,
	storeSnapshot,
	typeMatcher,
	waitFor,
	withTimeout,
} from "./utils";

export type { MockFn } from "./utils";

// Services (test runner and reporter)
export {
	after,
	before,
	describe,
	exportReport,
	formatReport,
	generateHtmlReport,
	generateJsonReport,
	getRegistry,
	it,
	only,
	printReport,
	runTests,
	test,
} from "./services";

// Application
export { executeTests, runTestSuite } from "./app";

// Note: Vitest utilities can be imported directly from 'vitest' package
// Example: import { describe, it, test } from 'vitest'
