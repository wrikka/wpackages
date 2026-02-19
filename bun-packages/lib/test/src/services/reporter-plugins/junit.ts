import { escapeCDATA, escapeXML, groupIntoSuites } from "./shared";
import type { JUnitTestSuite } from "./types";

export function generateJUnitXML(testResults: unknown): string {
	const suites = groupIntoSuites(testResults);
	const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
	const totalFailures = suites.reduce((sum, suite) => sum + suite.failures, 0);
	const totalErrors = suites.reduce((sum, suite) => sum + suite.errors, 0);
	const totalTime = suites.reduce((sum, suite) => sum + suite.time, 0);

	let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	xml += `<testsuites tests="${totalTests}" failures="${totalFailures}" errors="${totalErrors}" time="${totalTime}">\n`;

	for (const suite of suites) {
		xml += `  <testsuite name="${
			escapeXML(suite.name)
		}" tests="${suite.tests.length}" failures="${suite.failures}" errors="${suite.errors}" skipped="${suite.skipped}" time="${suite.time}">\n`;

		for (const test of suite.tests) {
			xml += `    <testcase name="${escapeXML(test.name)}" classname="${
				escapeXML(test.classname)
			}" time="${test.time}">\n`;

			if (test.failure) {
				xml += `      <failure message="${escapeXML(test.failure.message)}" type="${escapeXML(test.failure.type)}">\n`;
				xml += `        ${escapeCDATA(test.failure.text)}\n`;
				xml += `      </failure>\n`;
			}

			if (test.error) {
				xml += `      <error message="${escapeXML(test.error.message)}" type="${escapeXML(test.error.type)}">\n`;
				xml += `        ${escapeCDATA(test.error.text)}\n`;
				xml += `      </error>\n`;
			}

			if (test.skipped) {
				xml += `      <skipped message="${escapeXML(test.skipped.message)}" />\n`;
			}

			xml += `    </testcase>\n`;
		}

		xml += `  </testsuite>\n`;
	}

	xml += `</testsuites>\n`;
	return xml;
}

export type { JUnitTestSuite };
