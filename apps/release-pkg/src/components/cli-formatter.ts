/**
 * Pure functions for CLI formatting
 */

import pc from "picocolors";

/**
 * Format help text header
 */
export const formatHelpHeader = (title: string): string =>
	`${pc.bold(pc.cyan(title))}`;

/**
 * Format help section
 */
export const formatHelpSection = (title: string, content: string): string =>
	`${pc.bold(title)}\n${content}`;

/**
 * Format option line
 */
export const formatOptionLine = (
	flag: string,
	description: string,
	defaultValue?: string,
): string => {
	let line = `  ${flag.padEnd(20)} ${description}`;
	if (defaultValue) {
		line += ` (default: ${defaultValue})`;
	}
	return line;
};

/**
 * Format example
 */
export const formatExample = (command: string, description: string): string =>
	`  ${command.padEnd(40)} # ${description}`;

/**
 * Format step message
 */
export const formatStepMessage = (step: string, status: "pending" | "running" | "done"): string => {
	const icons = {
		pending: "⏳",
		running: "⚙️",
		done: "✓",
	};
	const colors = {
		pending: pc.gray,
		running: pc.cyan,
		done: pc.green,
	};
	return colors[status](`${icons[status]} ${step}`);
};

/**
 * Format progress bar
 */
export const formatProgressBar = (current: number, total: number, width = 20): string => {
	const percentage = (current / total) * 100;
	const filled = Math.round((width * current) / total);
	const empty = width - filled;
	const bar = "█".repeat(filled) + "░".repeat(empty);
	return `[${bar}] ${percentage.toFixed(0)}%`;
};

/**
 * Format table row
 */
export const formatTableRow = (columns: string[], widths: number[]): string =>
	columns
		.map((col, i) => col.padEnd(widths[i] ?? 20))
		.join(" | ");

/**
 * Format table separator
 */
export const formatTableSeparator = (widths: number[]): string =>
	widths.map((w) => "─".repeat(w)).join("─┼─");
