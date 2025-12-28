/**
 * Rule: no-null
 * Prefer undefined over null for functional programming
 * Unique to functional programming linters
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const noNull: Rule = createRule(
	{
		name: "no-null",
		description: "Prefer undefined over null for better functional programming",
		category: "functional",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const lines = sourceCode.split("\n");
		const nullRegex = /\bnull\b/g;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;

			// Skip comments and type annotations
			if (
				line.trim().startsWith("//") ||
				line.trim().startsWith("/*") ||
				line.includes("NonNullable") ||
				line.includes("| null") ||
				line.includes("null |")
			) {
				continue;
			}

			const regex = new RegExp(nullRegex);
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(line);
				if (match === null) break;
				// Skip if it's in a type context
				const beforeMatch = line.substring(0, match.index);
				if (beforeMatch.includes(":") && !beforeMatch.includes("=")) {
					continue;
				}

				messages.push(
					createMessage(
						"no-null",
						"Avoid 'null'. Use 'undefined' for optional values in functional programming",
						"warning",
						i + 1,
						match.index,
					),
				);
			}
		}

		return messages;
	},
);
