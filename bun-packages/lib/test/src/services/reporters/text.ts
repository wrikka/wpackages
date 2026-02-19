/**
 * Text reporter
 */

import type { TestReport } from "../../types";

export const formatReport = (report: TestReport): string => {
	const lines: string[] = [];
	lines.push("\n===== TEST REPORT =====\n");

	report.suites.forEach((suite) => {
		lines.push(`Suite: ${suite.name}`);
		suite.tests.forEach((test) => {
			const icon = test.status === "passed" ? "✅" : test.status === "failed" ? "❌" : "⏭️";
			lines.push(`  ${icon} ${test.name} (${test.duration}ms)`);
			if (test.error) {
				lines.push(`    Error: ${test.error.message}`);
			}
		});
	});

	lines.push("\n----- SUMMARY -----");
	lines.push(`Total Tests: ${report.totalTests}`);
	lines.push(`✅ Passed: ${report.passedTests}`);
	lines.push(`❌ Failed: ${report.failedTests}`);
	lines.push(`⏭️ Skipped: ${report.skippedTests}`);
	lines.push(`Duration: ${report.duration}ms`);
	lines.push(`\nSuccess: ${report.success ? "Yes" : "No"}\n`);

	return lines.join("\n");
};

export const printReport = (report: TestReport): void => {
	console.log(formatReport(report));
};
