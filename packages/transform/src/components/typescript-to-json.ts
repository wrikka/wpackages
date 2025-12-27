import { JsonParser } from "../services/json";
import { TypeScriptParser } from "../services/typescript";
import type { Transformer } from "../types";

/**
 * Transform TypeScript to JSON (AST representation)
 */
export const TypeScriptToJsonTransformer: Transformer = {
	from: "typescript",
	to: "json",

	transform: (source: string, options = {}): string => {
		const ast = TypeScriptParser.parse(source);
		return JsonParser.stringify(ast, options);
	},
};
