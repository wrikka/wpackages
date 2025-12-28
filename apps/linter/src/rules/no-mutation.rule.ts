/**
 * Rule: no-mutation
 * Enforce immutability by detecting mutation operations
 * This is a unique rule not found in Biome/Oxlint
 */

import type { Rule, LintMessage } from "../types";
import { createRule, createMessage } from "../components";

export const noMutation: Rule = createRule(
	{
		name: "no-mutation",
		description: "Disallow mutation of variables and objects",
		category: "functional",
		recommended: true,
		fixable: false,
	},
	(context) => {
		const { sourceCode } = context;
		const messages: LintMessage[] = [];

		const lines = sourceCode.split("\n");

		// Detect common mutation patterns
		const mutationPatterns = [
			{
				pattern: /\.push\s*\(/,
				message: "Use spread or concat instead of push",
			},
			{ pattern: /\.pop\s*\(/, message: "Use slice instead of pop" },
			{ pattern: /\.shift\s*\(/, message: "Use slice instead of shift" },
			{ pattern: /\.unshift\s*\(/, message: "Use spread instead of unshift" },
			{
				pattern: /\.splice\s*\(/,
				message: "Use slice/filter instead of splice",
			},
			{
				pattern: /\.sort\s*\(/,
				message: "Use toSorted() or [...arr].sort() instead",
			},
			{
				pattern: /\.reverse\s*\(/,
				message: "Use toReversed() or [...arr].reverse() instead",
			},
			{ pattern: /\+\+/, message: "Use += 1 or variable + 1 instead of ++" },
			{ pattern: /--/, message: "Use -= 1 or variable - 1 instead of --" },
		];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) continue;

			for (const { pattern, message } of mutationPatterns) {
				const match = pattern.exec(line);
				if (match) {
					// Skip if using spread operator before mutation (e.g., [...arr].sort())
					const beforeMatch = line.substring(0, match.index);
					if (
						beforeMatch.includes("[...") &&
						beforeMatch.lastIndexOf("[...") > beforeMatch.lastIndexOf("]")
					) {
						continue;
					}

					messages.push(
						createMessage(
							"no-mutation",
							message,
							"warning",
							i + 1,
							match.index,
						),
					);
				}
			}
		}

		return messages;
	},
);
