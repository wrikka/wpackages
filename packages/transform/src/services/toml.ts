import * as TOML from "@iarna/toml";
import type { Parser } from "../types";

/**
 * TOML Parser implementation
 */
export const TomlParser: Parser<TOML.JsonMap> = {
	format: "toml",

	parse: (content: string): TOML.JsonMap => {
		try {
			return TOML.parse(content);
		} catch (error) {
			throw new Error(`Failed to parse TOML: ${String(error)}`);
		}
	},

	stringify: (ast: TOML.JsonMap, _options = {}): string => {
		try {
			return TOML.stringify(ast);
		} catch (error) {
			throw new Error(`Failed to stringify TOML: ${String(error)}`);
		}
	},
};
