/**
 * Number Component (Pure Function)
 * Renders number input prompt
 */

import { colors } from "../../constant/color.const";
import { SYMBOLS } from "../../constant/symbol.const";

/**
 * Render number prompt
 */
export const renderNumberPrompt = (
	message: string,
	initial?: number,
): string => {
	const initialText = initial !== undefined ? colors.dim(` (${initial})`) : "";
	return `${colors.cyan(SYMBOLS.pointer)} ${message}${initialText}`;
};

/**
 * Render number validation error
 */
export const renderNumberError = (error: string): string => `  ${colors.red(SYMBOLS.error)} ${error}`;

/**
 * Render number result
 */
export const renderNumberResult = (value: number): string => colors.dim(`  ${SYMBOLS.success} ${value}`);
