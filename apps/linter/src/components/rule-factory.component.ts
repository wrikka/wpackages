/**
 * Rule Factory Component - Pure functions for creating lint rules
 *
 * Eliminates code duplication across rule implementations
 */

import type { LintMessage, Rule, RuleContext } from "../types";

/**
 * Create a basic regex-based rule checker
 *
 * @param ruleId - The rule identifier
 * @param pattern - The regex pattern to match
 * @param message - The message to display
 * @param severity - The severity level
 * @returns A function that checks source code
 */
export const createRegexRuleChecker = (
	ruleId: string,
	pattern: RegExp,
	message: string,
	severity: "error" | "warning" | "info" = "warning",
) => (context: RuleContext): LintMessage[] => {
	const { sourceCode } = context;
	const messages: LintMessage[] = [];
	const lines = sourceCode.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;

		let match: RegExpExecArray | null;
		const regex = new RegExp(pattern);
		while (true) {
			match = regex.exec(line);
			if (match === null) break;
			messages.push({
				ruleId,
				severity,
				message,
				line: i + 1,
				column: match.index,
			});
		}
	}

	return messages;
};

/**
 * Create a rule with metadata
 *
 * @param meta - Rule metadata
 * @param check - The check function
 * @returns A complete rule
 */
export const createRule = (
	meta: Rule["meta"],
	check: Rule["check"],
): Rule => ({
	meta,
	check,
});

/**
 * Filter out comment lines from source code
 *
 * @param lines - Array of source code lines
 * @param index - Current line index
 * @returns True if line is not a comment
 */
export const isNotCommentLine = (lines: string[], index: number): boolean => {
	const line = lines[index];
	if (!line) return false;
	const trimmed = line.trim();
	return !trimmed.startsWith("//") && !trimmed.startsWith("/*");
};

/**
 * Create a message object
 *
 * @param ruleId - The rule identifier
 * @param message - The message text
 * @param severity - The severity level
 * @param line - The line number
 * @param column - The column number
 * @param fix - Optional fix object
 * @returns A lint message
 */
export const createMessage = (
	ruleId: string,
	message: string,
	severity: "error" | "warning" | "info",
	line: number,
	column: number,
	fix?: { range: readonly [number, number]; text: string },
): LintMessage => ({
	ruleId,
	message,
	severity,
	line,
	column,
	...(fix && { fix }),
});
