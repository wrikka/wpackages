/**
 * Rule: no-var
 * Disallow var declarations, use const/let instead
 * Better than basic linters with auto-fix support
 */

import { createMessage, createRule, isNotCommentLine } from "../components";
import type { LintMessage, Rule } from "../types";

export const noVar: Rule = createRule(
	{
		name: "no-var",
		description: "Disallow var declarations, use const or let instead",
		category: "best-practices",
		recommended: true,
		fixable: true,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const varRegex = /\bvar\s+(\w+)/g;
		const lines = sourceCode.split("\n");

		for (let i = 0; i < lines.length; i++) {
			// Skip comments
			if (!isNotCommentLine(lines, i)) {
				continue;
			}

			const line = lines[i];
			if (!line) continue;

			const regex = new RegExp(varRegex);
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(line);
				if (match === null) break;
				messages.push(
					createMessage(
						"no-var",
						"Unexpected 'var' declaration. Use 'const' or 'let' instead",
						"error",
						i + 1,
						match.index,
						{
							range: [match.index, match.index + 3] as const,
							text: "let",
						},
					),
				);
			}
		}

		return messages;
	},
);
