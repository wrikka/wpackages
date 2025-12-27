/**
 * Rule: prefer-readonly
 * Suggest readonly modifier for class properties that are never modified
 * Advanced TypeScript rule not in basic linters
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const preferReadonly: Rule = createRule(
	{
		name: "prefer-readonly",
		description: "Suggest readonly modifier for immutable class properties",
		category: "typescript",
		recommended: true,
		fixable: true,
	},
	(context) => {
		const { sourceCode, filename } = context;
		const messages: LintMessage[] = [];

		// Only check TypeScript files
		if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) {
			return messages;
		}

		const lines = sourceCode.split("\n");

		// Detect class properties without readonly
		const propertyRegex = /^\s*(private|public|protected)?\s+(\w+):\s*\w+/;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;
			const match = propertyRegex.exec(line);

			if (match && !line.includes("readonly")) {
				const propName = match[2];

				// Simple heuristic: if property is not reassigned in class
				const assignRegex = new RegExp(`this\\.${propName}\\s*=`, "g");
				const assignments = sourceCode.match(assignRegex);

				// If only one assignment (likely in constructor), suggest readonly
				if (assignments && assignments.length <= 1) {
					messages.push(
						createMessage(
							"prefer-readonly",
							`Property '${propName}' is never modified. Consider making it readonly`,
							"info",
							i + 1,
							match.index || 0,
						),
					);
				}
			}
		}

		return messages;
	},
);
