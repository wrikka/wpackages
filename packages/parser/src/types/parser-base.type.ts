/**
 * Base types for all parsers
 */

import type { Result } from "../utils";
import type { Language } from "./language.type";
import type { ParseError } from "./parse-error.type";

/**
 * Generic parse result for any language
 */
export type GenericParseResult<T = unknown> = {
	readonly data: T;
	readonly language: Language;
	readonly errors: readonly ParseError[];
	readonly metadata?: Record<string, unknown>;
};

/**
 * Base parser interface that all parsers must implement
 */
export interface Parser<T = unknown> {
	readonly name: string;
	readonly supportedLanguages: readonly Language[];
	parse: (
		source: string,
		filename: string,
		options?: ParseOptionsBase,
	) => Result.Result<GenericParseResult<T>, string>;
}

/**
 * Base parse options for all parsers
 */
export type ParseOptionsBase = {
	readonly language?: Language;
	readonly strict?: boolean;
	readonly [key: string]: unknown;
};
