/**
 * JSON Parser - High-performance parsing with simdjson
 */

import { createParser } from "../components";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

// simdjson does not support the 'reviver' function or a strict mode toggle.
export type JSONParseOptions = ParseOptionsBase;

/**
 * JSON Parser implementation
 */
export const jsonParser: Parser<unknown> = createParser(
	"json",
	["json"] as const,
	(source: string, _filename: string, _options: ParseOptionsBase): unknown => JSON.parse(source),
);

/**
 * Parse JSON source
 */
export const parseJSON = (
	source: string,
	filename = "input.json",
	options: JSONParseOptions = {},
): Result.Result<GenericParseResult<unknown>, string> => {
	return jsonParser.parse(source, filename, options);
};
