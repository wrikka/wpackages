/**
 * Rule: no-console
 * Disallow console.log statements in production code
 */

import { findNodesByType } from "@wpackages/parser";
import type { CallExpression, Identifier, MemberExpression } from "oxc-parser";
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
		const messages: LintMessage[] = [];
		const { ast } = context;

		if (!ast) {
			return messages;
		}

		const consoleCalls = findNodesByType(ast, "CallExpression") as CallExpression[];

		for (const node of consoleCalls) {
			if (node.callee?.type !== "MemberExpression") {
				continue;
			}
			const callee = node.callee as MemberExpression;

			if (callee.object?.type !== "Identifier" || (callee.object as Identifier).name !== "console") {
				continue;
			}

			if (callee.property?.type !== "Identifier") {
				continue;
			}
			const member = callee.property as Identifier;

			messages.push(
				createMessage(
					"no-console",
					`Unexpected console.${member.name}() statement`,
					"warning",
					node.loc.start.line,
					node.loc.start.column,
				),
			);
		}

		return messages;
	},
);
