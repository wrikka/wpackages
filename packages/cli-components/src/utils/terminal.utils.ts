/**
 * Terminal Utilities (Pure Functions)
 * Terminal-related pure functions
 */

/**
 * Get terminal size
 */
export const getTerminalSize = (): {
	readonly width: number;
	readonly height: number;
} =>
	Object.freeze({
		width: process.stdout.columns || 80,
		height: process.stdout.rows || 24,
	});

/**
 * Check if colors are supported
 */
export const isColorSupported = (): boolean => {
	const forceColor = process.env.FORCE_COLOR;
	const term = process.env.TERM;
	return (
		forceColor !== "0"
		&& (forceColor === "1" || process.stdout?.isTTY === true || term !== "dumb")
	);
};
