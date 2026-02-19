/**
 * Format Result Component
 * Pure function to format parse results for display
 */

import type { GenericParseResult } from "../types";

export interface FormattedResult {
	readonly language: string;
	readonly errorCount: number;
	readonly hasErrors: boolean;
	readonly dataType: string;
}

/**
 * Format a parse result for display
 * Pure function - no side effects
 */
export const formatResult = (result: GenericParseResult): FormattedResult => {
	return {
		language: result.language,
		errorCount: result.errors.length,
		hasErrors: result.errors.length > 0,
		dataType: typeof result.data,
	};
};
