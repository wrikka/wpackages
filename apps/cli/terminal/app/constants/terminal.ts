export const TERMINAL_DEFAULTS = {
	COLS: 80,
	ROWS: 24,
	FONT_SIZE: 14,
	CHAR_WIDTH: 8.5,
	CHAR_HEIGHT: 16,
	CURSOR_COLOR: "#58a6ff",
} as const;

export const TERMINAL_COLORS = {
	DEFAULT_FG: "#c9d1d9",
	DEFAULT_BG: "#0d1117",
} as const;

export const createEmptyCell = (
	fg = TERMINAL_COLORS.DEFAULT_FG,
	bg = TERMINAL_COLORS.DEFAULT_BG,
) => ({
	char: " ",
	fg,
	bg,
	bold: false,
	italic: false,
	underline: false,
});

export const createEmptyBuffer = (
	cols = TERMINAL_DEFAULTS.COLS,
	rows = TERMINAL_DEFAULTS.ROWS,
) => ({
	rows: Array(rows)
		.fill(null)
		.map(() =>
			Array(cols)
				.fill(null)
				.map(() => createEmptyCell()),
		),
	cursor: { x: 0, y: 0, visible: true },
	scrollback: [],
});
