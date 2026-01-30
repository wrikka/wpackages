/**
 * Rule: no-unsafe-eval
 * Disallow eval() and Function() constructor for security
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const noUnsafeEval: Rule = createRule(
	{
		name: "no-eval",
		description: "Disallow eval() and Function() constructor",
		category: "security",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const lines = sourceCode.split("\n");

		const dangerousPatterns = [
			{
				pattern: /\beval\s*\(/,
				message: "eval() is unsafe and should not be used",
			},
			{
				pattern: /new\s+Function\s*\(/,
				message: "Function() constructor is unsafe",
			},
			{
				pattern: /setTimeout\s*\(\s*["'`]/,
				message: "setTimeout with string is unsafe, use function instead",
			},
			{
				pattern: /setInterval\s*\(\s*["'`]/,
				message: "setInterval with string is unsafe, use function instead",
			},
		];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;

			for (const { pattern, message } of dangerousPatterns) {
				const match = pattern.exec(line);
				if (match) {
					messages.push(
						createMessage("no-eval", message, "error", i + 1, match.index),
					);
				}
			}
		}

		return messages;
	},
);
