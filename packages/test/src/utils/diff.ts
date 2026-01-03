/**
 * Simple, dependency-free diffing utility with colors.
 */

import { inspect } from "util";

// ANSI Color Codes
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const gray = (str: string) => `\x1b[90m${str}\x1b[0m`;

const format = (value: unknown): string => {
	return inspect(value, { colors: true, depth: null });
};

export const createDiff = (expected: unknown, actual: unknown): string => {
	const expectedStr = format(expected);
	const actualStr = format(actual);

	if (expectedStr === actualStr) {
		return ""; // No diff to show
	}

	// For objects and arrays, just show the formatted values with labels.
	if (typeof expected === 'object' && typeof actual === 'object' && expected !== null && actual !== null) {
		return `\n\n${green(`- Expected`)}\n${red(`+ Received`)}\n\n${green(`- ${expectedStr}`)}\n${red(`+ ${actualStr}`)}`;
	}

	// Basic line-by-line diff for strings
	if (typeof expected === 'string' && typeof actual === 'string') {
		const expLines = expected.split('\n');
		const actLines = actual.split('\n');
		const maxLines = Math.max(expLines.length, actLines.length);
		let diff = "";
		let hasDiff = false;

		for (let i = 0; i < maxLines; i++) {
			const expLine = expLines[i];
			const actLine = actLines[i];

			if (expLine !== actLine) {
				hasDiff = true;
				if (expLine !== undefined) diff += `\n${green(`- ${expLine}`)}`;
				if (actLine !== undefined) diff += `\n${red(`+ ${actLine}`)}`;
			} else {
				diff += `\n${gray(`  ${expLine}`)}`;
			}
		}
		return hasDiff ? `\n\n${green(`- Expected`)}\n${red(`+ Received`)}${diff}` : "";
	}

	// Fallback for other types
	return `\n\n${green(`- Expected: ${expectedStr}`)}\n${red(`+ Received: ${actualStr}`)}`;
};
