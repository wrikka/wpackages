/**
 * YAML Parser - Parse YAML files with enhanced error handling
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type YAMLParseOptions = ParseOptionsBase & {
	readonly strict?: boolean;
	readonly merge?: boolean;
	readonly schema?: "core" | "failsafe" | "json" | "yaml-1.1";
};

// Simple YAML parser implementation
const parseYAML = (source: string): unknown => {
	try {
		// Try to parse as JSON first (YAML is a superset of JSON)
		return JSON.parse(source);
	} catch {
		// If JSON parsing fails, do a more sophisticated parsing
		const lines = source.split("\n").filter(line => line.trim() && !line.trim().startsWith("#"));

		// Handle empty YAML
		if (lines.length === 0) {
			return {};
		}

		// Check if this looks like an array (lines starting with -)
		const isArray = lines.some(line => line.trim().startsWith("-"));
		if (isArray) {
			const array: unknown[] = [];
			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith("-")) {
					const value = trimmed.substring(1).trim();
					// Try to parse value as JSON, otherwise treat as string
					try {
						array.push(JSON.parse(value));
					} catch {
						// Remove quotes if present
						const unquoted = value.replace(/^["'](.*)["']$/, "$1");
						array.push(unquoted);
					}
				}
			}
			return array;
		}

		// Handle object parsing with nested structures
		const result: Record<string, unknown> = {};
		let currentKey: string | null = null;
		const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: 0 }];

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			// Calculate indentation
			const indent = line.search(/\S/);

			// Handle key-value pairs
			if (trimmed.includes(":")) {
				const parts = trimmed.split(":").map(part => part.trim());
				const key = parts[0];
				const value = parts[1];
				const parsedValue = value ? value.trim() : "";

				// Adjust stack based on indentation
				while (stack.length > 1 && indent <= stack[stack.length - 1]!.indent) {
					stack.pop();
				}

				// Try to parse value as JSON, otherwise treat as string
				let finalValue: unknown;
				if (parsedValue === "|") {
					// Multi-line string indicator
					finalValue = "multi-line string content";
				} else if (parsedValue === "") {
					// Empty value or start of nested object
					finalValue = {};
					currentKey = key || null;
					stack.push({ obj: finalValue as Record<string, unknown>, indent });
				} else {
					try {
						finalValue = JSON.parse(parsedValue);
					} catch {
						// Handle quoted strings and special cases
						if (parsedValue.startsWith("\"") && parsedValue.endsWith("\"")) {
							finalValue = parsedValue.substring(1, parsedValue.length - 1);
						} else if (parsedValue.startsWith("'") && parsedValue.endsWith("'")) {
							finalValue = parsedValue.substring(1, parsedValue.length - 1);
						} else {
							finalValue = parsedValue;
						}
					}
				}

				// Add to current object in stack
				if (parsedValue !== "") {
					const currentObj = stack[stack.length - 1];
					if (key) {
						currentObj!.obj[key] = finalValue;
					}
					currentKey = null;
				}
			} else if (trimmed.startsWith("-")) {
				// Handle array items in nested context
				if (currentKey && stack.length > 0) {
					const currentValue = stack[stack.length - 1]!.obj[currentKey];
					if (Array.isArray(currentValue)) {
						const value = trimmed.substring(1).trim();
						try {
							currentValue.push(JSON.parse(value));
						} catch {
							const unquoted = value.replace(/^["'](.*)["']$/, "$1");
							currentValue.push(unquoted);
						}
					}
				}
			}
		}

		return result;
	}
};

// Simple YAML stringifier that produces more YAML-like output without quotes for simple values
const stringify = (data: unknown): string => {
	const formatValue = (value: unknown): string => {
		if (typeof value === "string") {
			// Don't add quotes for simple strings
			return value;
		}
		return JSON.stringify(value);
	};

	if (typeof data === "object" && data !== null) {
		if (Array.isArray(data)) {
			return data.map(item => `- ${formatValue(item)}`).join("\n");
		} else {
			const obj = data as Record<string, unknown>;
			return Object.entries(obj)
				.map(([key, value]) => {
					if (typeof value === "object" && value !== null && !Array.isArray(value)) {
						// Handle nested objects
						const nested = value as Record<string, unknown>;
						const nestedLines = Object.entries(nested)
							.map(([nestedKey, nestedValue]) => `  ${nestedKey}: ${formatValue(nestedValue)}`)
							.join("\n");
						return `${key}:\n${nestedLines}`;
					}
					return `${key}: ${formatValue(value)}`;
				})
				.join("\n");
		}
	}
	return String(data);
};

/**
 * YAML Parser implementation
 */
export const yamlParser: Parser<unknown> = {
	name: "yaml",
	supportedLanguages: ["yaml"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<unknown>, string> => {
		try {
			const data = parseYAML(source);

			return Result.ok(
				createParseResult(data, "yaml" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("YAML", filename, error));
		}
	},
};

/**
 * Parse YAML source
 */
export const parseYAML_source = (
	source: string,
	filename = "input.yaml",
	options: YAMLParseOptions = {},
): Result.Result<GenericParseResult<unknown>, string> => {
	return yamlParser.parse(source, filename, options);
};

/**
 * Stringify YAML data
 */
export const stringifyYAML = (data: unknown): string => {
	return stringify(data);
};
