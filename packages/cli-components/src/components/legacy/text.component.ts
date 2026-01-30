/**
 * Text Component (Pure Function)
 * Renders text input prompt - no side effects
 */

import { colors } from "../../constant/color.const";
import { SYMBOLS } from "../../constant/symbol.const";

/**
 * Render text prompt header
 */
export const renderTextHeader = (message: string): string => `${colors.cyan(SYMBOLS.pointer)} ${message}`;

/**
 * Render text input line
 */
export const renderTextInput = (
	value: string,
	placeholder?: string,
): string => {
	const display = value || (placeholder ? colors.dim(placeholder) : "");
	return `  ${display}`;
};

/**
 * Render validation error
 */
export const renderError = (error: string): string => `  ${colors.red(SYMBOLS.error)} ${error}`;

/**
 * Render success indicator
 */
export const renderSuccess = (value: string): string => colors.dim(`  ${SYMBOLS.success} ${value}`);
