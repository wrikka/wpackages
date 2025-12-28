/**
 * Test reporter service
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
	formatReport as formatReportBase,
	generateJsonReport as generateJsonReportBase,
	printReport as printReportBase,
} from "reporter";
import type { TestReport } from "../types";

/**
 * Format test report
 */
export const formatReport = (report: TestReport): string => {
	return formatReportBase(report);
};

/**
 * Print report to console
 */
export const printReport = (report: TestReport): void => {
	printReportBase(report);
};

/**
 * Generate JSON report
 */
export const generateJsonReport = (report: TestReport): string => {
	return generateJsonReportBase(report);
};

/**
 * Generate HTML report
 */
export const generateHtmlReport = (report: TestReport): string => {
	const html = `
<!DOCTYPE html>
<html>
<head>
	<title>Test Report</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 20px; }
		.summary { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
		.passed { color: green; }
		.failed { color: red; }
		.skipped { color: orange; }
		.suite { margin-bottom: 20px; }
		.test { margin-left: 20px; padding: 5px; }
		.error { color: red; font-size: 0.9em; margin-left: 40px; }
	</style>
</head>
<body>
	<h1>Test Report</h1>
	<div class="summary">
		<p>Total Tests: ${report.totalTests}</p>
		<p class="passed">✅ Passed: ${report.passedTests}</p>
		<p class="failed">❌ Failed: ${report.failedTests}</p>
		<p class="skipped">⏭️ Skipped: ${report.skippedTests}</p>
		<p>Duration: ${report.duration}ms</p>
	</div>
	<div class="suites">
		${
		report.suites
			.map(
				(suite) => `
		<div class="suite">
			<h2>${suite.name}</h2>
			${
					suite.tests
						.map(
							(test) => `
			<div class="test">
				<span class="${test.status}">${test.status === "passed" ? "✅" : test.status === "failed" ? "❌" : "⏭️"}</span>
				${test.name} (${test.duration}ms)
				${test.error ? `<div class="error">Error: ${test.error.message}</div>` : ""}
			</div>
			`,
						)
						.join("")
				}
		</div>
		`,
			)
			.join("")
	}
	</div>
</body>
</html>
	`;
	return html;
};

/**
 * Export report to file
 */
export const exportReport = async (
	report: TestReport,
	format: "json" | "html" | "text" = "json",
	filename: string,
): Promise<void> => {
	let content: string;

	switch (format) {
		case "json":
			content = generateJsonReport(report);
			break;
		case "html":
			content = generateHtmlReport(report);
			break;
		case "text":
			content = formatReport(report);
			break;
	}

	await mkdir(dirname(filename), { recursive: true });
	await writeFile(filename, content, "utf8");
};
