import { javascriptParser } from "@wpackages/parser";
import type { JavaScriptAST } from "@wpackages/parser";
import type { Parser } from "../types";

/**
 * TypeScript/JavaScript Parser implementation using OXC
 * Note: Can be upgraded to use parser once workspace dependencies are configured
 */
export const TypeScriptParser: Parser<JavaScriptAST> = {
	format: "typescript",

	parse: (content: string): JavaScriptAST => {
		const result = javascriptParser.parse(content, "input.ts", { typescript: true });
		if (result.isErr()) {
			throw new Error(`Failed to parse TypeScript: ${result.error}`);
		}
		return result.value.data;
	},

	stringify: (ast: JavaScriptAST, options = {}): string => {
		return javascriptParser.stringify(ast, options);
	},
};
