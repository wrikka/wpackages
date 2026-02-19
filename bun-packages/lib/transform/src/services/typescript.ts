import { javascriptParser, Result } from "@wpackages/parser";
import type { JavaScriptAST } from "@wpackages/parser";
import type { Parser } from "../types";

/**
 * TypeScript/JavaScript Parser implementation using OXC
 */
export const TypeScriptParser: Parser<JavaScriptAST> = {
	format: "typescript",

	parse: (content: string): JavaScriptAST => {
		const result = javascriptParser.parse(content, "input.ts", { typescript: true });
		if (Result.isErr(result)) {
			throw new Error(`Failed to parse TypeScript: ${result.error}`);
		}

		// Return the AST data (program and comments)
		// Note: OXC may report recoverable errors, but we still get valid AST
		return result.value.data;
	},

	stringify: (_ast: JavaScriptAST, _options = {}): string => {
		// TODO: Implement stringify when javascriptParser has stringify method
		throw new Error("TypeScript stringify not yet implemented");
	},
};
