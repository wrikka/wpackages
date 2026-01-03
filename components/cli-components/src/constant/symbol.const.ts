/**
 * Symbol Constants (Immutable)
 * UI symbols for prompts - frozen objects
 */

export const SYMBOLS = Object.freeze(
	{
		// Status
		success: "✓",
		error: "✗",
		warning: "⚠",
		info: "i",

		// Navigation
		pointer: "❯",
		pointerSmall: "›",
		arrowUp: "↑",
		arrowDown: "↓",
		arrowLeft: "←",
		arrowRight: "→",

		// Selection
		checkbox: "☐",
		checkboxChecked: "☑",
		radio: "◯",
		radioSelected: "◉",

		// UI Elements
		bar: "─",
		pipe: "│",
		corner: "└",

		// Loading
		spinner: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	} as const,
);

export type SymbolKey = keyof typeof SYMBOLS;

/**
 * Default spinner frame interval (ms)
 */
export const SPINNER_INTERVAL = 80 as const;
