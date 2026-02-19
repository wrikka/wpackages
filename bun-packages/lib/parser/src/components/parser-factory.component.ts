/**
 * Parser Factory Component
 * Pure function factory for creating standardized parsers
 * Eliminates code duplication across all parser implementations
 */

import type { GenericParseResult, Language, ParseOptionsBase, Parser } from "../types";
import { Result } from "../utils";
import { createParseErrorMessage, createParseResult } from "./create-parse-result.component";

/**
 * Parser implementation function type
 */
export type ParserImplementation<T> = (
	source: string,
	filename: string,
	options: ParseOptionsBase,
) => T;

/**
 * Create a standardized parser
 * Pure function - no side effects
 * Handles error catching and result wrapping
 */
export const createParser = <T>(
	name: string,
	supportedLanguages: readonly Language[],
	implementation: ParserImplementation<T>,
): Parser<T> => {
	return {
		name,
		supportedLanguages,
		parse: (
			source: string,
			filename: string,
			options: ParseOptionsBase = {},
		): Result.Result<GenericParseResult<T>, string> => {
			try {
				const data = implementation(source, filename, options);
				return Result.ok(
					createParseResult(data, supportedLanguages[0]!, filename, source.length),
				);
			} catch (error) {
				return Result.err(createParseErrorMessage(name, filename, error));
			}
		},
	};
};

/**
 * Create a parser with custom language detection
 * Pure function - no side effects
 */
export const createParserWithLanguage = <T>(
	name: string,
	supportedLanguages: readonly Language[],
	implementation: ParserImplementation<T>,
	detectLanguage: (filename: string, options: ParseOptionsBase) => Language,
): Parser<T> => {
	return {
		name,
		supportedLanguages,
		parse: (
			source: string,
			filename: string,
			options: ParseOptionsBase = {},
		): Result.Result<GenericParseResult<T>, string> => {
			try {
				const data = implementation(source, filename, options);
				const language = detectLanguage(filename, options);
				return Result.ok(
					createParseResult(data, language, filename, source.length),
				);
			} catch (error) {
				return Result.err(createParseErrorMessage(name, filename, error));
			}
		},
	};
};

/**
 * Create a parser with custom error handling
 * Pure function - no side effects
 */
export const createParserWithErrorHandler = <T>(
	name: string,
	supportedLanguages: readonly Language[],
	implementation: ParserImplementation<T>,
	errorHandler: (error: unknown, filename: string) => string,
): Parser<T> => {
	return {
		name,
		supportedLanguages,
		parse: (
			source: string,
			filename: string,
			options: ParseOptionsBase = {},
		): Result.Result<GenericParseResult<T>, string> => {
			try {
				const data = implementation(source, filename, options);
				return Result.ok(
					createParseResult(data, supportedLanguages[0]!, filename, source.length),
				);
			} catch (error) {
				return Result.err(errorHandler(error, filename));
			}
		},
	};
};
