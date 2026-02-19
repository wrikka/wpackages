// =================================================================
// Configuration Types
// =================================================================

export interface WTestConfig {
	testMatch?: string[];
	testTimeoutMs?: number;
	retries?: number;
}

// =================================================================
// Test Definition & Runner Core Types
// =================================================================

export type TestFunction = () => void | Promise<void>;

export interface TestCase {
	name: string;
	fn: TestFunction;
}

export interface TestSuite {
	name: string;
	tests: TestCase[];
	suites: TestSuite[];
	beforeAllHooks: TestFunction[];
	afterAllHooks: TestFunction[];
	beforeEachHooks: TestFunction[];
	afterEachHooks: TestFunction[];
}

// =================================================================
// Reporter & Result Types
// =================================================================

export type TestStatus = "passed" | "failed" | "skipped" | "pending";

export interface SerializableError {
	message: string;
	stack?: string;
}

export interface TestResult {
	suiteName: string;
	testName: string;
	status: TestStatus;
	durationMs?: number;
	error?: SerializableError;
}

export interface TestReportTest {
	name: string;
	duration: number;
	status: TestStatus;
	error?: SerializableError;
	assertions: unknown[];
}

export interface TestReportSuite {
	name: string;
	tests: TestReportTest[];
	duration: number;
	status: TestStatus;
}

export interface TestReport {
	suites: TestReportSuite[];
	totalTests: number;
	passedTests: number;
	failedTests: number;
	skippedTests: number;
	duration: number;
	success: boolean;
}

// =================================================================
// Assertion & Matcher Types
// =================================================================

export interface AssertionOptions {
	message?: string;
	timeout?: number;
}

export interface MatcherResult {
	pass: boolean;
	message: () => string;
}

export type CustomMatcher<T> = (
	actual: T,
	expected: T,
	options?: AssertionOptions,
) => MatcherResult;

export interface SnapshotOptions {
	name?: string;
	update?: boolean;
}
