import { JsonParser, TypeScriptParser } from "../services";
import type { Transformer } from "../types";

/**
 * Transform JSON to TypeScript (value to type definition)
 */
export const JsonToTypeScriptTransformer: Transformer = {
	from: "json",
	to: "typescript",

	transform: (source: string, options = {}): string => {
		const json = JsonParser.parse(source);

		// A simple heuristic to convert a JSON object to a TypeScript type
		const buildType = (value: unknown): string => {
			if (typeof value === "string") return "string";
			if (typeof value === "number") return "number";
			if (typeof value === "boolean") return "boolean";
			if (Array.isArray(value)) {
				const memberType = value.length > 0 ? buildType(value[0]) : "unknown";
				return `${memberType}[]`;
			}
			if (typeof value === "object" && value !== null) {
				const properties = Object.entries(value)
					.map(([key, val]) => `  ${key}: ${buildType(val)};`)
					.join("\n");
				return `{\n${properties}\n}`;
			}
			return "unknown";
		};

		const typeString = `export type GeneratedType = ${buildType(json)};`;

		// Use the real parser to format the generated code
		const ast = TypeScriptParser.parse(typeString);
		return TypeScriptParser.stringify(ast, options);
	},
};
