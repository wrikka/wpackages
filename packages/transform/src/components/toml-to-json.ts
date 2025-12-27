import { JsonParser } from "../services/json";
import { TomlParser } from "../services/toml";
import type { Transformer } from "../types";

/**
 * Transform TOML to JSON
 */
export const TomlToJsonTransformer: Transformer = {
	from: "toml",
	to: "json",

	transform: (source: string, options = {}): string => {
		const ast = TomlParser.parse(source);
		return JsonParser.stringify(ast, options);
	},
};
