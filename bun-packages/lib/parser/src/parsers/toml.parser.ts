/**
 * TOML Parser - Parse TOML configuration files using @ltd/j-toml
 */

import TOML from "@ltd/j-toml";
import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type TOMLParseOptions = ParseOptionsBase;

/**
 * Stringify TOML data
 */
export const stringifyTOML = (data: unknown): string => {
	return TOML.stringify(data as any, { newline: "\n" });
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
			const data = TOML.parse(source, { joiner: "." });

			// j-toml can return an array of tables, so we merge them.
			const mergedData = Array.isArray(data)
				? data.reduce((acc, curr) => ({ ...acc, ...curr }), {})
				: data;

			return Result.ok(
				createParseResult(mergedData as Record<string, unknown>, "toml" as Language, filename, source.length),
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
