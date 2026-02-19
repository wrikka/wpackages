import type { FlatTestResult, JUnitTestCase, JUnitTestSuite } from "./types";

export function flattenTests(testResults: unknown): FlatTestResult[] {
	const tests: FlatTestResult[] = [];

	const traverse = (results: any): void => {
		if (Array.isArray(results)) {
			for (const result of results) {
				traverse(result);
			}
			return;
		}

		if (results && typeof results === "object" && Array.isArray(results.tests)) {
			for (const test of results.tests) {
				tests.push(test);
			}
			return;
		}

		if (results && typeof results === "object" && typeof results.name === "string") {
			tests.push(results);
		}
	};

	traverse(testResults as any);
	return tests;
}

export function escapeXML(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export function escapeCDATA(text: string): string {
	return text.replace(/]]>/g, "]]]]><![CDATA[>");
}

export function escapeTeamCity(text: string): string {
	return text
		.replace(/[|]/g, "||")
		.replace(/'/g, "|'")
		.replace(/\n/g, "|n")
		.replace(/\r/g, "|r")
		.replace(/\[/g, "|[")
		.replace(/\]/g, "|]");
}

export function groupIntoSuites(testResults: unknown): JUnitTestSuite[] {
	const suites = new Map<string, JUnitTestCase[]>();

	for (const test of flattenTests(testResults)) {
		const suiteName = test.suite || "Default";
		if (!suites.has(suiteName)) {
			suites.set(suiteName, []);
		}
		suites.get(suiteName)!.push(convertToJUnitCase(test));
	}

	return Array.from(suites.entries()).map(([name, tests]) => ({
		name,
		tests,
		failures: tests.filter((t) => t.failure).length,
		errors: tests.filter((t) => t.error).length,
		skipped: tests.filter((t) => t.skipped).length,
		time: tests.reduce((sum, t) => sum + t.time, 0),
	}));
}

export function convertToJUnitCase(test: FlatTestResult): JUnitTestCase {
	const testCase: JUnitTestCase = {
		name: test.name,
		classname: test.suite || "Default",
		time: (test.duration || 0) / 1000,
	};

	if (!test.passed && !test.skipped) {
		if (test.error) {
			testCase.error = {
				message: test.error.message || "Error",
				type: test.error.name || "Error",
				text: test.error.stack || test.error.message || "Error",
			};
		} else {
			testCase.failure = {
				message: test.diagnostic?.message || "Test failed",
				type: "AssertionError",
				text: test.diagnostic?.stack || test.diagnostic?.message || "Test failed",
			};
		}
	}

	if (test.skipped) {
		testCase.skipped = {
			message: test.diagnostic?.message || "Skipped",
		};
	}

	return testCase;
}
