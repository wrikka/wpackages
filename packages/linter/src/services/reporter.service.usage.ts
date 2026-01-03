/**
 * Usage examples for reporter service
 */

import type { LintMessage, LintReport, LintResult } from "../types";

// Example 1: Report with no issues
const example1 = () => {
	console.log("=== Example 1: Clean report (no issues) ===");

	const report: LintReport = {
		results: [],
		errorCount: 0,
		warningCount: 0,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
		filesLinted: 5,
	};

	console.log("Report:", report);
};

// Example 2: Report with errors and warnings
const example2 = () => {
	console.log("\n=== Example 2: Report with issues ===");

	const messages: LintMessage[] = [
		{
			ruleId: "no-console",
			severity: "warning",
			message: "Unexpected console.log()",
			line: 10,
			column: 5,
		},
		{
			ruleId: "no-explicit-any",
			severity: "warning",
			message: "Unexpected 'any' type",
			line: 15,
			column: 12,
		},
	];

	const result: LintResult = {
		filePath: "src/app.ts",
		messages,
		errorCount: 0,
		warningCount: 2,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
	};

	const report: LintReport = {
		results: [result],
		errorCount: 0,
		warningCount: 2,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
		filesLinted: 1,
	};

	console.log("Report:", report);
};

// Example 3: Report with fixable issues
const example3 = () => {
	console.log("\n=== Example 3: Fixable issues ===");

	const messages: LintMessage[] = [
		{
			ruleId: "no-debugger",
			severity: "error",
			message: "Unexpected debugger statement",
			line: 20,
			column: 3,
			fix: {
				range: [0, 8],
				text: "",
			},
		},
	];

	const result: LintResult = {
		filePath: "src/utils.ts",
		messages,
		errorCount: 1,
		warningCount: 0,
		fixableErrorCount: 1,
		fixableWarningCount: 0,
	};

	const report: LintReport = {
		results: [result],
		errorCount: 1,
		warningCount: 0,
		fixableErrorCount: 1,
		fixableWarningCount: 0,
		filesLinted: 1,
	};

	console.log("Report:", report);
};

// Example 4: Multiple files
const example4 = () => {
	console.log("\n=== Example 4: Multiple files ===");

	const results: LintResult[] = [
		{
			filePath: "src/index.ts",
			messages: [],
			errorCount: 0,
			warningCount: 0,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
		},
		{
			filePath: "src/app.ts",
			messages: [
				{
					ruleId: "no-mutation",
					severity: "warning",
					message: "Use spread instead of push",
					line: 25,
					column: 8,
				},
			],
			errorCount: 0,
			warningCount: 1,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
		},
	];

	const report: LintReport = {
		results,
		errorCount: 0,
		warningCount: 1,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
		filesLinted: 2,
	};

	console.log("Report:", report);
};

// Run examples
const runExamples = () => {
	example1();
	example2();
	example3();
	example4();
};

export { example1, example2, example3, example4, runExamples };

if (import.meta.main) {
	runExamples();
}
