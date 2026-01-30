export interface TestReport {
	suites: readonly unknown[];
	totalTests: number;
	passedTests: number;
	failedTests: number;
	skippedTests: number;
	duration: number;
	success: boolean;
}
