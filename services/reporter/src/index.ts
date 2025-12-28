export interface TestReport {
	suites: readonly unknown[];
	totalTests: number;
	passedTests: number;
	failedTests: number;
	skippedTests: number;
	duration: number;
	success: boolean;
}

export const formatReport = (report: TestReport): string => {
	const lines: string[] = [];

	lines.push("\n" + "=".repeat(60));
	lines.push("TEST REPORT");
	lines.push("=".repeat(60) + "\n");

	lines.push(`Total Tests: ${report.totalTests}`);
	lines.push(`Passed: ${report.passedTests}`);
	lines.push(`Failed: ${report.failedTests}`);
	lines.push(`Skipped: ${report.skippedTests}`);
	lines.push(`Duration: ${report.duration}ms\n`);

	lines.push("=".repeat(60));
	lines.push(report.success ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
	lines.push("=".repeat(60) + "\n");

	return lines.join("\n");
};

export const printReport = (report: TestReport): void => {
	console.log(formatReport(report));
};

export const generateJsonReport = (report: TestReport): string => {
	return JSON.stringify(report, null, 2);
};
