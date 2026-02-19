/**
 * Create Parse Result Component
 * Pure function to create standardized parse results
 */

import type { GenericParseResult, Language } from "../types";
import type { ParseError } from "../types/parse-error.type";

/**
 * Create a successful parse result
 * Pure function - no side effects
 */
export const createParseResult = <T>(
	data: T,
	language: Language,
	filename: string,
	sourceLength: number,
	errors: readonly ParseError[] = [],
	metadata: Record<string, unknown> = {},
): GenericParseResult<T> => {
	return {
		data,
		language,
		errors,
		metadata: {
			filename,
			size: sourceLength,
			...metadata,
		},
	};
};

/**
 * Create parse error message
 * Pure function - no side effects
 */
export const createParseErrorMessage = (
	language: string,
	filename: string,
	error: unknown,
): string => {
	const message = error instanceof Error ? error.message : "Unknown error";
	return `${language} parse error in ${filename}: ${message}`;
};
