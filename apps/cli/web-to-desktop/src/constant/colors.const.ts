/**
 * ANSI color constants
 */

export const COLORS = {
	bright: (s: string) => `\x1b[1m${s}\x1b[22m`,
	cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
	green: (s: string) => `\x1b[32m${s}\x1b[39m`,
	yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
	red: (s: string) => `\x1b[31m${s}\x1b[39m`,
	dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
} as const;
