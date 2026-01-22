/**
 * no-class - Prefer functional patterns over classes
 *
 * Enforces functional programming by discouraging class usage
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const noClass: Rule = createRule(
	{
		name: "no-class",
		description: "Prefer functional patterns over classes",
		category: "functional",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		// Simple regex to detect class declarations
		const classPattern = /\bclass\s+(\w+)/g;
		let match: RegExpExecArray | null;

		while (true) {
			match = classPattern.exec(sourceCode);
			if (match === null) break;
			const lines = sourceCode.substring(0, match.index).split("\n");
			const line = lines.length;
			const lastLine = lines[lines.length - 1] || "";
			const column = lastLine.length + 1;

			const className = match[1] || "unknown";
			messages.push(
				createMessage(
					"no-class",
					`Avoid using class '${className}'. Prefer functions and composition.`,
					"warning",
					line,
					column,
				),
			);
		}

		return messages;
	},
);
