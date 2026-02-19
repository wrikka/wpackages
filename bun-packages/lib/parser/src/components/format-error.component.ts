/**
 * Format Error Component
 * Pure function to format parse errors for display
 */

import type { ParseError } from "../types";

export interface FormattedError {
	readonly message: string;
	readonly line: number;
	readonly column: number;
}

/**
 * Format a parse error for display
 * Pure function - no side effects
 */
export const formatError = (error: ParseError): FormattedError => {
	return {
		message: error.message,
		line: error.line,
		column: error.column,
	};
};

/**
 * Format multiple errors
 * Pure function - no side effects
 */
export const formatErrors = (errors: readonly ParseError[]): readonly FormattedError[] => {
	return errors.map(formatError);
};
