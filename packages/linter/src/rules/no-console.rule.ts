/**
 * Rule: no-console
 * Disallow console.log statements in production code
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const noConsole: Rule = createRule(
	{
		name: "no-console",
		description: "Disallow console statements",
		category: "best-practices",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		// Simple regex-based detection (can be enhanced with AST traversal)
		const consoleRegex = /console\.(log|warn|error|info|debug|trace)\s*\(/g;
		const lines = sourceCode.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;

			let match: RegExpExecArray | null;
			while (true) {
				match = consoleRegex.exec(line);
				if (match === null) break;
				messages.push(
					createMessage(
						"no-console",
						`Unexpected console.${match[1]}() statement`,
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
