import { parseSync } from "oxc-parser";
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
		try {
			const result = parseSync("input.ts", content);

			if (result.errors.length > 0) {
				const errorMessages = result.errors.map((e) => String(e)).join(", ");
				throw new Error(`Parse errors: ${errorMessages}`);
			}

			return result.program as unknown as TypeScriptAST;
		} catch (error) {
			throw new Error(`Failed to parse TypeScript: ${String(error)}`);
		}
	},

	stringify: (_ast: TypeScriptAST, _options = {}): string => {
		// Code generation not yet implemented
		throw new Error("TypeScript code generation not yet implemented");
	},
};
