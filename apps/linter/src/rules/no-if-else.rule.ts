/**
 * no-if-else - Prefer pattern matching or ternary over if-else
 *
 * Encourages functional patterns for conditionals
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const noIfElse: Rule = createRule(
	{
		name: "no-if-else",
		description: "Prefer pattern matching or ternary over if-else chains",
		category: "functional",
		recommended: false,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		// Detect if-else chains (more than 2 branches)
		const ifElsePattern = /if\s*\([^)]+\)\s*{[^}]*}\s*else\s*if\s*\([^)]+\)/g;
		let match: RegExpExecArray | null;

		while (true) {
			match = ifElsePattern.exec(sourceCode);
			if (match === null) break;
			const lines = sourceCode.substring(0, match.index).split("\n");
			const line = lines.length;
			const lastLine = lines[lines.length - 1] || "";
			const column = lastLine.length + 1;

			messages.push(
				createMessage(
					"no-if-else",
					"Consider using pattern matching (match/switch) or lookup tables instead of if-else chains",
					"info",
					line,
					column,
				),
			);
		}

		return messages;
	},
);
