/**
 * ANSI escape codes for terminal control
 */
export const ANSI = {
	CLEAR_SCREEN: "\x1b[2J",
	CLEAR_LINE: "\x1b[2K",
	SHOW_CURSOR: "\x1b[?25h",
	HIDE_CURSOR: "\x1b[?25l",
	moveCursor: (x: number, y: number) => `\x1b[${y};${x}H`,
} as const;
