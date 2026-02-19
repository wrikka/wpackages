import { flattenTests } from "./shared";
import type { TAPTest } from "./types";

export function generateTAP(testResults: unknown): string {
	const tests = flattenTests(testResults) as unknown as TAPTest[];
	let tap = `TAP version 14\n`;
	tap += `1..${tests.length}\n`;

	tests.forEach((test, index) => {
		const testNum = index + 1;

		if (test.passed) {
			tap += `ok ${testNum} - ${test.name}\n`;
			return;
		}

		if (test.skipped) {
			tap += `ok ${testNum} - ${test.name} # SKIP ${test.diagnostic?.message || ""}\n`;
			return;
		}

		tap += `not ok ${testNum} - ${test.name}\n`;
		if (!test.diagnostic) {
			return;
		}

		tap += `  ---\n`;
		tap += `  severity: ${test.diagnostic.severity}\n`;
		tap += `  message: ${test.diagnostic.message}\n`;
		if (test.diagnostic.stack) {
			tap += `  stack: |\n`;
			test.diagnostic.stack.split("\n").forEach((line) => {
				tap += `    ${line}\n`;
			});
		}
		tap += `  ...\n`;
	});

	return tap;
}

export type { TAPTest };
