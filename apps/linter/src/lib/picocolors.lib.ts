/**
 * Picocolors wrapper - Functional interface for color library
 *
 * Provides pure functions for terminal colors without side effects
 */

import pc from "picocolors";

/**
 * Color utilities for terminal output
 */
export const Colors = {
	// Basic colors
	black: (str: string) => pc.black(str),
	red: (str: string) => pc.red(str),
	green: (str: string) => pc.green(str),
	yellow: (str: string) => pc.yellow(str),
	blue: (str: string) => pc.blue(str),
	magenta: (str: string) => pc.magenta(str),
	cyan: (str: string) => pc.cyan(str),
	white: (str: string) => pc.white(str),

	// Bright colors
	brightBlack: (str: string) => pc.gray(str),
	brightRed: (str: string) => pc.red(str),
	brightGreen: (str: string) => pc.green(str),
	brightYellow: (str: string) => pc.yellow(str),
	brightBlue: (str: string) => pc.blue(str),
	brightMagenta: (str: string) => pc.magenta(str),
	brightCyan: (str: string) => pc.cyan(str),
	brightWhite: (str: string) => pc.white(str),

	// Background colors
	bgBlack: (str: string) => pc.bgBlack(str),
	bgRed: (str: string) => pc.bgRed(str),
	bgGreen: (str: string) => pc.bgGreen(str),
	bgYellow: (str: string) => pc.bgYellow(str),
	bgBlue: (str: string) => pc.bgBlue(str),
	bgMagenta: (str: string) => pc.bgMagenta(str),
	bgCyan: (str: string) => pc.bgCyan(str),
	bgWhite: (str: string) => pc.bgWhite(str),

	// Modifiers
	bold: (str: string) => pc.bold(str),
	dim: (str: string) => pc.dim(str),
	italic: (str: string) => pc.italic(str),
	underline: (str: string) => pc.underline(str),
	inverse: (str: string) => pc.inverse(str),
	hidden: (str: string) => pc.hidden(str),
	strikethrough: (str: string) => pc.strikethrough(str),

	// Reset
	reset: (str: string) => pc.reset(str),
};

/**
 * Semantic color functions
 */
export const Semantic = {
	// Success/error states
	success: (str: string) => Colors.green(str),
	error: (str: string) => Colors.red(str),
	warning: (str: string) => Colors.yellow(str),
	info: (str: string) => Colors.blue(str),

	// File states
	added: (str: string) => Colors.green(str),
	removed: (str: string) => Colors.red(str),
	modified: (str: string) => Colors.yellow(str),

	// Lint severity
	errorBadge: (str: string) => Colors.bgRed(Colors.white(str)),
	warningBadge: (str: string) => Colors.bgYellow(Colors.black(str)),
	infoBadge: (str: string) => Colors.bgBlue(Colors.white(str)),

	// File paths
	filePath: (str: string) => Colors.cyan(str),
	fileExtension: (str: string) => Colors.dim(str),

	// Code elements
	keyword: (str: string) => Colors.magenta(str),
	string: (str: string) => Colors.green(str),
	number: (str: string) => Colors.yellow(str),
	comment: (str: string) => Colors.dim(str),
};

/**
 * Check if colors are enabled
 */
export const isColorEnabled = (): boolean => pc.isColorSupported;

/**
 * Conditional coloring
 */
export const colorIf = (
	condition: boolean,
	colorFn: (str: string) => string,
	str: string,
): string => (condition ? colorFn(str) : str);

/**
 * Strip all colors from string
 */
export const stripColors = (str: string): string => {
	// Remove ANSI color codes (ESC [ ... m)
	// eslint-disable-next-line no-control-regex
	return str.replace(/\u001b\[[0-9;]*m/g, "");
};
