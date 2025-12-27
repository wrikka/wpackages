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
	// biome-ignore lint/complexity/useLiteralKeys: process.env requires bracket notation
	const forceColor = process.env["FORCE_COLOR"];
	// biome-ignore lint/complexity/useLiteralKeys: process.env requires bracket notation
	const term = process.env["TERM"];
	return (
		forceColor !== "0"
		&& (forceColor === "1" || process.stdout?.isTTY === true || term !== "dumb")
	);
};
