import { TERMINAL_DEFAULTS } from "../constant";

/**
 * Get terminal size with defaults
 */
export const getTerminalSizeWithDefaults = (
	rows: number | undefined,
	columns: number | undefined,
): { rows: number; columns: number } => ({
	rows: rows || TERMINAL_DEFAULTS.DEFAULT_ROWS,
	columns: columns || TERMINAL_DEFAULTS.DEFAULT_COLUMNS,
});

/**
 * Calculate visible list height
 */
export const calculateListHeight = (
	totalRows: number,
	headerHeight: number,
	footerHeight: number,
): number => {
	return totalRows - headerHeight - footerHeight;
};

/**
 * Calculate visible range for list
 */
export const calculateVisibleRange = (
	selectedIndex: number,
	listHeight: number,
	totalItems: number,
): { startIndex: number; endIndex: number } => {
	const startIndex = Math.max(0, selectedIndex - listHeight + 1);
	const endIndex = Math.min(totalItems, startIndex + listHeight);
	return { startIndex, endIndex };
};

/**
 * Format task display with padding
 */
export const formatDisplayWithPadding = (
	name: string,
	command: string,
	maxNameLength: number,
): { name: string; padding: string; command: string } => {
	const padding = " ".repeat(Math.max(0, maxNameLength - name.length + 2));
	return { name, padding, command };
};
