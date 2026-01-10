// Checkbox symbols
export const CHECKBOX_SYMBOLS = {
	checked: "[x]",
	unchecked: "[ ]",
	checkedCircle: "(*)",
	uncheckedCircle: "( )",
	checkedSquare: "[■]",
	uncheckedSquare: "[□]",
} as const;

// Radio symbols
export const RADIO_SYMBOLS = {
	selected: "(*)",
	unselected: "( )",
	selectedDot: "(•)",
	unselectedDot: "( )",
	selectedArrow: "(►)",
	unselectedArrow: "( )",
} as const;

// Spinner patterns
export const SPINNER_PATTERNS = {
	dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	line: ["-", "\\", "|", "/"],
	bar: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"],
} as const;

// Progress bar characters
export const PROGRESS_CHARS = {
	filled: "█",
	empty: "░",
	altFilled: "▓",
	altEmpty: "▒",
} as const;

// Scrollbar characters
export const SCROLLBAR_CHARS = {
	thumb: "█",
	track: "░",
	arrowUp: "▲",
	arrowDown: "▼",
} as const;

// Canvas drawing characters
export const CANVAS_CHARS = {
	pixel: "█",
	line: "─",
	vertical: "│",
	cornerTL: "┌",
	cornerTR: "┐",
	cornerBL: "└",
	cornerBR: "┘",
	cross: "┼",
	crossLeft: "├",
	crossRight: "┤",
	crossTop: "┬",
	crossBottom: "┴",
} as const;

// Chart characters
export const CHART_CHARS = {
	line: "─",
	point: "●",
	emptyPoint: "○",
	axisVertical: "│",
	axisHorizontal: "─",
	grid: "·",
} as const;

// Button variants
export const BUTTON_VARIANTS = {
	default: { prefix: "[", suffix: "]" },
	primary: { prefix: "[", suffix: "]" },
	danger: { prefix: "[", suffix: "]" },
	success: { prefix: "[", suffix: "]" },
} as const;

// Input cursor
export const INPUT_CURSOR = {
	block: "█",
	underline: "_",
	pipe: "|",
} as const;

// Table borders
export const TABLE_BORDERS = {
	horizontal: "─",
	vertical: "│",
	cornerTL: "┌",
	cornerTR: "┐",
	cornerBL: "└",
	cornerBR: "┘",
	cross: "┼",
	crossLeft: "├",
	crossRight: "┤",
	crossTop: "┬",
	crossBottom: "┴",
} as const;

// Modal borders
export const MODAL_BORDERS = {
	horizontal: "─",
	vertical: "│",
	cornerTL: "╔",
	cornerTR: "╗",
	cornerBL: "╚",
	cornerBR: "╝",
	crossLeft: "╠",
	crossRight: "╣",
	crossTop: "╦",
	crossBottom: "╩",
	cross: "╬",
} as const;

// Dropdown arrow
export const DROPDOWN_ARROW = {
	open: "▼",
	closed: "▶",
} as const;

// Tab separator
export const TAB_SEPARATOR = {
	vertical: "│",
	space: " ",
} as const;

// Sparkline characters
export const SPARKLINE_CHARS = {
	min: "▁",
	low: "▂",
	midLow: "▃",
	mid: "▄",
	midHigh: "▅",
	high: "▆",
	max: "▇",
	full: "█",
} as const;
