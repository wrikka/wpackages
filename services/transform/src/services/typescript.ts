import { parseSource } from "parser";
import type { Parser } from "../types";

interface TypeScriptAST {
	type: "Program";
	body: unknown[];
	sourceType: string;
}

/**
 * TypeScript/JavaScript Parser implementation using OXC
 * Note: Can be upgraded to use parser once workspace dependencies are configured
 */
export const TypeScriptParser: Parser<TypeScriptAST> = {
	format: "typescript",

	parse: (content: string): TypeScriptAST => {
		const result = parseSource(content, "input.ts", { jsx: false, typescript: true });
		if (result.ok === false) {
			throw new Error(`Failed to parse TypeScript: ${result.error}`);
		}
		return result.value.ast as unknown as TypeScriptAST;
	},

	stringify: (_ast: TypeScriptAST, _options = {}): string => {
		// Code generation not yet implemented
		throw new Error("TypeScript code generation not yet implemented");
	},
};
