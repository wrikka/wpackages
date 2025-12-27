import pc from "picocolors";

/**
 * Color utilities
 */
export const colors = {
	// Basic colors
	reset: pc.reset,
	bold: pc.bold,
	dim: pc.dim,
	italic: pc.italic,
	underline: pc.underline,

	// Foreground colors
	black: pc.black,
	red: pc.red,
	green: pc.green,
	yellow: pc.yellow,
	blue: pc.blue,
	magenta: pc.magenta,
	cyan: pc.cyan,
	white: pc.white,
	gray: pc.gray,

	// Background colors
	bgBlack: pc.bgBlack,
	bgRed: pc.bgRed,
	bgGreen: pc.bgGreen,
	bgYellow: pc.bgYellow,
	bgBlue: pc.bgBlue,
	bgMagenta: pc.bgMagenta,
	bgCyan: pc.bgCyan,
	bgWhite: pc.bgWhite,
} as const;

/**
 * Semantic colors
 */
export const semantic = {
	success: pc.green,
	error: pc.red,
	warning: pc.yellow,
	info: pc.cyan,
	muted: pc.gray,
	highlight: pc.magenta,
	link: pc.blue,
} as const;
