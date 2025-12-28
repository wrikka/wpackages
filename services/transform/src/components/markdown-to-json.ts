import { JsonParser } from "../services/json";
import { MarkdownParser } from "../services/markdown";
import type { Transformer } from "../types";

/**
 * Transform Markdown to JSON (AST representation)
 */
export const MarkdownToJsonTransformer: Transformer = {
	from: "markdown",
	to: "json",

	transform: (source: string, options = {}): string => {
		const ast = MarkdownParser.parse(source);
		return JsonParser.stringify(ast, options);
	},
};
