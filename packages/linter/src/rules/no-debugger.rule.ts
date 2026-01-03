/**
 * Rule: no-debugger
 * Disallow debugger statements
 */

import { createMessage, createRule } from "../components";
import type { LintMessage, Rule } from "../types";

export const noDebugger: Rule = createRule(
	{
		name: "no-debugger",
		description: "Disallow debugger statements",
		category: "errors",
		recommended: true,
		fixable: true,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const debuggerRegex = /\bdebugger\b/g;
		const lines = sourceCode.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;
			let match: RegExpExecArray | null;

			while (true) {
				match = debuggerRegex.exec(line);
				if (match === null) break;
				messages.push(
					createMessage(
						"no-debugger",
						"Unexpected debugger statement",
						"error",
						i + 1,
						match.index,
						{
							range: [match.index, match.index + 8] as const,
							text: "",
						},
					),
				);
			}
		}

		return messages;
	},
);
