import type { JsonMap } from "@iarna/toml";
import { JsonParser } from "../services/json";
import { TomlParser } from "../services/toml";
import type { Transformer } from "../types";

/**
 * Transform JSON to TOML
 */
export const JsonToTomlTransformer: Transformer = {
	from: "json",
	to: "toml",

	transform: (source: string, options = {}): string => {
		const ast = JsonParser.parse(source);
		return TomlParser.stringify(ast as JsonMap, options);
	},
};
