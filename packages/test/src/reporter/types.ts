export type TestStatus = 'passed' | 'failed';

export interface TestResult {
	suiteName: string;
	testName: string;
	status: TestStatus;
	error?: Error;
}
