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
	TestStatus,
	AssertionResult,
	TestMetadata,
	TestSuite,
	TestContext,
	AssertionOptions,
	MatcherResult,
	CustomMatcher,
	TestFn,
	TestHook,
	SnapshotOptions,
	TestReport,
} from "./types";

// Configuration
export type { TestConfig } from "./config";
export { defaultConfig, createConfig } from "./config";

// Constants
export { DEFAULT_TIMEOUT, DEFAULT_RETRIES, DEFAULT_PARALLEL, TEST_STATUS, ERROR_MESSAGES } from "./constant";

// Pure components (assertions)
export { expect, AssertionError, Assertion } from "./components";

// Utilities
export {
	storeSnapshot,
	getSnapshot,
	matchSnapshot,
	clearSnapshots,
	getAllSnapshots,
	createMatcher,
	deepEqualMatcher,
	typeMatcher,
	rangeMatcher,
	arrayLengthMatcher,
	patternMatcher,
	createMock,
	spyOn,
	restore,
	waitFor,
	delay,
	retry,
	race,
	withTimeout,
	batch,
	sequential,
} from "./utils";

export type { MockFn } from "./utils";

// Services (test runner and reporter)
export {
	describe,
	test,
	it,
	before,
	after,
	runTests,
	getRegistry,
	formatReport,
	printReport,
	generateJsonReport,
	generateHtmlReport,
	exportReport,
} from "./services";

// Application
export { runTestSuite, executeTests } from "./app";

// Note: Vitest utilities can be imported directly from 'vitest' package
// Example: import { describe, it, test } from 'vitest'
