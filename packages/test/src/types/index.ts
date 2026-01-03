/**
 * Core testing types and interfaces
 */

/**
 * Represents the status of a test or suite.
 * - `passed`: The test or suite completed successfully.
 * - `failed`: The test or suite failed due to an assertion error or an unexpected exception.
 * - `skipped`: The test was intentionally skipped.
 * - `pending`: The test has not been run yet.
 */
export type TestStatus = "passed" | "failed" | "skipped" | "pending";

/**
 * Represents the result of a single assertion within a test.
 */
export interface AssertionResult {
	status: TestStatus;
	message: string;
	expected?: unknown;
	actual?: unknown;
	stack?: string;
}

/**
 * Contains metadata about a single test case execution.
 */
export interface TestMetadata {
	name: string;
	duration: number;
	status: TestStatus;
	/** The error thrown by the test function, if any. */
	error?: Error;
	/** The error thrown by a `before` or `after` hook, if any. */
	hookError?: Error;
	assertions: AssertionResult[];
}

/**
 * Represents a collection of related tests, typically defined by a `describe` block.
 */
export interface TestSuite {
	name: string;
	tests: TestMetadata[];
	duration: number;
	status: TestStatus;
}

/**
 * An object passed to each test function, providing context and utilities.
 */
export interface TestContext {
	name: string;
	/** A function to dynamically skip the current test. */
	skip: () => void;
	/** A placeholder for `only` functionality, not used during execution. */
	only: () => void;
}

/**
 * Assertion options
 */
export interface AssertionOptions {
	message?: string;
	timeout?: number;
}

/**
 * Matcher result
 */
export interface MatcherResult {
	pass: boolean;
	message: () => string;
}

/**
 * Custom matcher
 */
export type CustomMatcher<T> = (
	actual: T,
	expected: T,
	options?: AssertionOptions,
) => MatcherResult;

/**
 * The function that contains the test logic, passed to `it` or `test`.
 */
export type TestFn = (context: TestContext) => void | Promise<void>;

/**
 * A function that runs before or after tests, such as `before` or `after`.
 */
export type TestHook = () => void | Promise<void>;

/**
 * Snapshot options
 */
export interface SnapshotOptions {
	name?: string;
	update?: boolean;
}

/**
 * A summary of the entire test run, containing results for all suites and tests.
 */
export interface TestReport {
	suites: TestSuite[];
	totalTests: number;
	passedTests: number;
	failedTests: number;
	skippedTests: number;
	duration: number;
	success: boolean;
}
