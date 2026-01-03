/**
 * Rule: prefer-arrow-function
 * Prefer arrow functions for better functional programming
 * Arrow functions are more concise and don't bind 'this'
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const preferArrowFunction: Rule = createRule(
	{
		name: "prefer-arrow-function",
		description: "Prefer arrow functions over function expressions",
		category: "functional",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const lines = sourceCode.split("\n");

		// Detect function expressions
		const functionExprRegex = /\bfunction\s*\(/g;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;

			// Skip function declarations (they're different from expressions)
			if (
				line.trim().startsWith("function ")
				|| line.trim().startsWith("export function ")
			) {
				continue;
			}

			// Skip comments
			if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
				continue;
			}

			const regex = new RegExp(functionExprRegex);
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(line);
				if (match === null) break;
				messages.push(
					createMessage(
						"prefer-arrow-function",
						"Prefer arrow function syntax for better functional programming",
						"info",
						i + 1,
						match.index,
					),
				);
			}
		}

		return messages;
	},
);
