/**
 * Rule: no-explicit-any
 * Disallow explicit 'any' type in TypeScript
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const noExplicitAny: Rule = createRule(
	{
		name: "no-explicit-any",
		description: "Disallow explicit 'any' type annotations",
		category: "typescript",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode, filename } = context;
		const messages: LintMessage[] = [];

		// Only check TypeScript files
		if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) {
			return messages;
		}

		const anyRegex = /:\s*any\b/g;
		const lines = sourceCode.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;
			const regex = new RegExp(anyRegex);
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(line);
				if (match === null) break;
				// Skip if in comment
				if (line.trim().startsWith("//")) continue;

				messages.push(
					createMessage(
						"no-explicit-any",
						"Unexpected 'any' type. Use a more specific type instead",
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
