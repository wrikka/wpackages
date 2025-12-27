/**
 * Terminal Service
 * High-level terminal control operations
 */

import * as Output from "./output.service";

/**
 * Render content at specific position (no refresh)
 */
export const renderAtPosition = (
	content: string,
	linesToMoveUp: number,
): void => {
	if (linesToMoveUp > 0) {
		Output.cursorUp(linesToMoveUp);
		Output.clearFromCursor();
	}
	Output.write(content);
};

/**
 * Execute function with hidden cursor
 */
export const withHiddenCursor = async <T>(fn: () => Promise<T>): Promise<T> => {
	Output.hideCursor();
	try {
		return await fn();
	} finally {
		Output.showCursor();
	}
};

/**
 * Execute function in raw mode
 */
export const withRawMode = async <T>(fn: () => Promise<T>): Promise<T> => {
	const wasRaw = process.stdin.isRaw;

	if (process.stdin.isTTY && !wasRaw) {
		process.stdin.setRawMode(true);
	}

	try {
		return await fn();
	} finally {
		if (process.stdin.isTTY && !wasRaw) {
			process.stdin.setRawMode(false);
		}
	}
};

/**
 * Clear and render (for initial render)
 */
export const clearAndRender = (content: string): void => {
	Output.clearScreen();
	Output.write(content);
};

/**
 * Count lines in content
 */
export const countLines = (content: string): number => content.split("\n").length;
