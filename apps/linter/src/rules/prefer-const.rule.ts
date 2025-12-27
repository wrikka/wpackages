/**
 * Rule: prefer-const
 * Suggest using const instead of let when variable is never reassigned
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const preferConst: Rule = createRule(
	{
		name: "prefer-const",
		description: "Suggest using const instead of let when not reassigned",
		category: "best-practices",
		recommended: true,
		fixable: true,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		// Simple detection: let declarations followed by no reassignment
		const letRegex = /\blet\s+(\w+)\s*=/g;
		const lines = sourceCode.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;
			const regex = new RegExp(letRegex);
			let match: RegExpExecArray | null;
			while (true) {
				match = regex.exec(line);
				if (match === null) break;
				const varName = match[1];

				// Check if variable is reassigned later (simple heuristic)
				const reassignRegex = new RegExp(`\\b${varName}\\s*=(?!=)`, "g");
				const restOfCode = lines.slice(i).join("\n");
				const matches = restOfCode.match(reassignRegex);

				// If only one match (the declaration), suggest const
				if (matches && matches.length === 1) {
					messages.push(
						createMessage(
							"prefer-const",
							`'${varName}' is never reassigned. Use 'const' instead`,
							"warning",
							i + 1,
							match.index,
							{
								range: [match.index, match.index + 3] as const,
								text: "const",
							},
						),
					);
				}
			}
		}

		return messages;
	},
);
