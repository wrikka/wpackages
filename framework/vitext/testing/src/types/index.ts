/**
 * Core testing types and interfaces
 */

/**
 * Test result status
 */
export type TestStatus = "passed" | "failed" | "skipped" | "pending";

/**
 * Assertion result
 */
export interface AssertionResult {
	status: TestStatus;
	message: string;
	expected?: unknown;
	actual?: unknown;
	stack?: string;
}

/**
 * Test metadata
 */
export interface TestMetadata {
	name: string;
	duration: number;
	status: TestStatus;
	error: Error | undefined;
	assertions: AssertionResult[];
}

/**
 * Test suite
 */
export interface TestSuite {
	name: string;
	tests: TestMetadata[];
	duration: number;
	status: TestStatus;
}

/**
 * Test context
 */
export interface TestContext {
	name: string;
	skip: () => void;
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
 * Test function
 */
export type TestFn = (context: TestContext) => void | Promise<void>;

/**
 * Test hook
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
 * Test report
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
