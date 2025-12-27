/**
 * prefer-pipe - Encourage using pipe for function composition
 *
 * Suggests using pipe() for better readability in functional code
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const preferPipe: Rule = createRule(
	{
		name: "prefer-pipe",
		description: "Prefer pipe() for function composition",
		category: "functional",
		recommended: false,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		// Detect nested function calls like: f(g(h(x)))
		const nestedPattern = /(\w+)\((\w+)\((\w+)\(/g;
		const regex = new RegExp(nestedPattern);
		let match: RegExpExecArray | null;
		while (true) {
			match = regex.exec(sourceCode);
			if (match === null) break;
			const lines = sourceCode.substring(0, match.index).split("\n");
			const line = lines.length;
			const lastLine = lines[lines.length - 1] || "";
			const column = lastLine.length + 1;

			messages.push(
				createMessage(
					"prefer-pipe",
					"Consider using pipe() for better readability",
					"info",
					line,
					column,
				),
			);
		}

		return messages;
	},
);
