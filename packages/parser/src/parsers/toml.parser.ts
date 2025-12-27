/**
 * TOML Parser - Parse TOML configuration files
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

// @aduh95/toml doesn't have a strict mode option in its basic parse API.
export type TOMLParseOptions = ParseOptionsBase;

/**
 * Stringify TOML data
 */
export const stringifyTOML = (data: unknown): string => {
	if (typeof data === "object" && data !== null) {
		const obj = data as Record<string, unknown>;
		return Object.entries(obj)
			.map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
			.join("\n");
	}
	return String(data);
};

// Simple TOML parser implementation
const parseTOML = (source: string): Record<string, unknown> => {
	try {
		// Try to parse as JSON first
		return JSON.parse(source);
	} catch {
		// Simple TOML parsing for basic key-value pairs
		const lines = source.split("\n").filter(line => line.trim() && !line.trim().startsWith("#"));
		const result: Record<string, unknown> = {};

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.includes("=")) {
				const parts = trimmed.split("=").map(part => part.trim());
				const key = parts[0];
				const value = parts[1];

				if (key && value) {
					// Try to parse value as JSON, otherwise treat as string
					try {
						result[key] = JSON.parse(value);
					} catch {
						// Remove quotes if present
						const unquoted = value.replace(/^["'](.*)["']$/, "$1");
						result[key] = unquoted;
					}
				}
			}
		}

		return result;
	}
};

/**
 * TOML Parser implementation
 */
export const tomlParser: Parser<Record<string, unknown>> = {
	name: "toml",
	supportedLanguages: ["toml"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<Record<string, unknown>>, string> => {
		try {
			const data = parseTOML(source);

			return Result.ok(
				createParseResult(data, "toml" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("TOML", filename, error));
		}
	},
};

/**
 * Parse TOML source
 */
export const parseTOMLSource = (
	source: string,
	filename = "input.toml",
	options: TOMLParseOptions = {},
): Result.Result<GenericParseResult<Record<string, unknown>>, string> => {
	return tomlParser.parse(source, filename, options);
};
