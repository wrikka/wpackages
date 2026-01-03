export type TestStatus = "passed" | "failed";

export interface SerializableError {
	message: string;
	stack?: string;
}

export interface TestResult {
	suiteName: string;
	testName: string;
	status: TestStatus;
	error?: SerializableError;
}
