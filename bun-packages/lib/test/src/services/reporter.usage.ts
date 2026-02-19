/**
 * Usage examples for test reporter
 */

import type { TestReport } from "../types";
import { exportReport, formatReport, generateHtmlReport, generateJsonReport, printReport } from "./reporter";

// Example 1: Format report as string
export const example1_formatReport = () => {
	const report: TestReport = {
		suites: [
			{
				name: "Calculator",
				tests: [
					{
						name: "should add numbers",
						duration: 5,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 5,
				status: "passed",
			},
		],
		totalTests: 1,
		passedTests: 1,
		failedTests: 0,
		skippedTests: 0,
		duration: 5,
		success: true,
	};

	const formatted = formatReport(report);
	console.log(formatted);
};

// Example 2: Print report to console
export const example2_printReport = () => {
	const report: TestReport = {
		suites: [
			{
				name: "User Service",
				tests: [
					{
						name: "should create user",
						duration: 10,
						status: "passed",
						error: undefined,
						assertions: [],
					},
					{
						name: "should delete user",
						duration: 8,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 18,
				status: "passed",
			},
		],
		totalTests: 2,
		passedTests: 2,
		failedTests: 0,
		skippedTests: 0,
		duration: 18,
		success: true,
	};

	printReport(report);
};

// Example 3: Generate JSON report
export const example3_generateJsonReport = () => {
	const report: TestReport = {
		suites: [
			{
				name: "API Tests",
				tests: [
					{
						name: "should fetch data",
						duration: 50,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 50,
				status: "passed",
			},
		],
		totalTests: 1,
		passedTests: 1,
		failedTests: 0,
		skippedTests: 0,
		duration: 50,
		success: true,
	};

	const json = generateJsonReport(report);
	console.log("JSON Report:");
	console.log(json);
};

// Example 4: Generate HTML report
export const example4_generateHtmlReport = () => {
	const report: TestReport = {
		suites: [
			{
				name: "Database Tests",
				tests: [
					{
						name: "should connect to database",
						duration: 100,
						status: "passed",
						error: undefined,
						assertions: [],
					},
					{
						name: "should query data",
						duration: 50,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 150,
				status: "passed",
			},
		],
		totalTests: 2,
		passedTests: 2,
		failedTests: 0,
		skippedTests: 0,
		duration: 150,
		success: true,
	};

	generateHtmlReport(report);
	console.log("HTML Report generated");
	// Save to file: fs.writeFileSync('report.html', html);
};

// Example 5: Export report with failed tests
export const example5_exportReportWithFailures = async () => {
	const report: TestReport = {
		suites: [
			{
				name: "Integration Tests",
				tests: [
					{
						name: "should integrate services",
						duration: 100,
						status: "passed",
						error: undefined,
						assertions: [],
					},
					{
						name: "should handle errors",
						duration: 50,
						status: "failed",
						error: new Error("Timeout"),
						assertions: [],
					},
				],
				duration: 150,
				status: "failed",
			},
		],
		totalTests: 2,
		passedTests: 1,
		failedTests: 1,
		skippedTests: 0,
		duration: 150,
		success: false,
	};

	await exportReport(report, "json", "test-report.json");
	await exportReport(report, "html", "test-report.html");
};

// Example 6: Real-world scenario - CI/CD integration
export const example6_cicdIntegration = async () => {
	const report: TestReport = {
		suites: [
			{
				name: "Unit Tests",
				tests: [
					{
						name: "test 1",
						duration: 10,
						status: "passed",
						error: undefined,
						assertions: [],
					},
					{
						name: "test 2",
						duration: 15,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 25,
				status: "passed",
			},
			{
				name: "Integration Tests",
				tests: [
					{
						name: "integration test 1",
						duration: 100,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 100,
				status: "passed",
			},
		],
		totalTests: 3,
		passedTests: 3,
		failedTests: 0,
		skippedTests: 0,
		duration: 125,
		success: true,
	};

	// Print to console
	printReport(report);

	// Export for CI/CD
	await exportReport(report, "json", "test-results.json");
	await exportReport(report, "html", "test-results.html");

	// Exit with appropriate code
	process.exit(report.success ? 0 : 1);
};
