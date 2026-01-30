import type { Parser } from "../types";

/**
 * JSON Parser implementation
 */
export const JsonParser: Parser<unknown> = {
	format: "json",

	parse: (content: string): unknown => {
		try {
			return JSON.parse(content);
		} catch (error) {
			throw new Error(`Failed to parse JSON: ${String(error)}`);
		}
	},

	stringify: (ast: unknown, options = {}): string => {
		const { pretty = true, indent = 2 } = options;

		try {
			return JSON.stringify(ast, null, pretty ? indent : 0);
		} catch (error) {
			throw new Error(`Failed to stringify JSON: ${String(error)}`);
		}
	},
};
