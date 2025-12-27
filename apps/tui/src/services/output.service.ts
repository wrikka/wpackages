/**
 * Output Service
 * Unified terminal output handler (with side effects)
 * Consolidates console and output operations
 */

/**
 * Write to stdout
 */
export const write = (text: string): void => {
	process.stdout.write(text);
};

/**
 * Write line to stdout
 */
export const writeLine = (text = ""): void => {
	console.log(text);
};

/**
 * Write error to stderr
 */
export const error = (message: string): void => {
	console.error(message);
};

/**
 * Write warning to stderr
 */
export const warn = (message: string): void => {
	console.warn(message);
};

/**
 * Clear line (move to start and clear)
 */
export const clearLine = (length: number): void => {
	write("\r".padEnd(length, " ") + "\r");
};

/**
 * Clear screen
 */
export const clearScreen = (): void => {
	console.clear();
};

/**
 * Move cursor up N lines
 */
export const cursorUp = (lines: number): void => {
	write(`\x1b[${lines}A`);
};

/**
 * Clear from cursor to end
 */
export const clearFromCursor = (): void => {
	write("\x1b[J");
};

/**
 * Hide cursor
 */
export const hideCursor = (): void => {
	write("\x1b[?25l");
};

/**
 * Show cursor
 */
export const showCursor = (): void => {
	write("\x1b[?25h");
};

/**
 * Move cursor to home position
 */
export const cursorHome = (): void => {
	write("\x1b[H");
};
