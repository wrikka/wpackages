/**
 * Color Constants (Immutable)
 * ANSI color codes - frozen objects
 */

export const ANSI_COLORS = Object.freeze(
	{
		// Reset
		reset: "\x1b[0m",

		// Styles
		bright: "\x1b[1m",
		dim: "\x1b[2m",

		// Foreground colors
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",

		// Background colors
		bgBlack: "\x1b[40m",
		bgRed: "\x1b[41m",
		bgGreen: "\x1b[42m",
		bgYellow: "\x1b[43m",
		bgBlue: "\x1b[44m",
		bgMagenta: "\x1b[45m",
		bgCyan: "\x1b[46m",
		bgWhite: "\x1b[47m",
	} as const,
);

/**
 * Color helper functions (Pure)
 */
import pc from "picocolors";

export const colors = {
	info: pc.blue,
	success: pc.green,
	warning: pc.yellow,
	error: pc.red,
	highlight: pc.cyan,
	bright: pc.bold,
	dim: pc.dim,
	red: pc.red,
	green: pc.green,
	yellow: pc.yellow,
	blue: pc.blue,
	magenta: pc.magenta,
	cyan: pc.cyan,
	white: pc.white,
} as const;
