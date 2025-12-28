/**
 * String Utilities (Pure Functions)
 * No side effects, immutable operations
 */

/**
 * Truncate string to specified length
 */
export const truncate = (
	str: string,
	maxLength: number,
	ellipsis = "...",
): string => {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Pad string to specified width
 */
export const pad = (str: string, width: number, char = " "): string => {
	if (str.length >= width) return str;
	return str + char.repeat(width - str.length);
};

/**
 * Center text within specified width
 */
export const center = (text: string, width: number): string => {
	const padding = Math.max(0, width - text.length);
	const left = Math.floor(padding / 2);
	const right = padding - left;
	return " ".repeat(left) + text + " ".repeat(right);
};

/**
 * Strip ANSI codes from string
 */
export const stripAnsi = (str: string): string => {
	// eslint-disable-next-line no-control-regex
	return str.replace(/\x1b\[[0-9;]*m/g, "");
};

/**
 * Get string width without ANSI codes
 */
export const stringWidth = (str: string): number => stripAnsi(str).length;

/**
 * Wrap text to specified width
 */
export const wrap = (text: string, maxWidth: number): readonly string[] => {
	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		if (stringWidth(testLine) <= maxWidth) {
			currentLine = testLine;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return Object.freeze(lines);
};

/**
 * Pad string to right alignment
 */
export const rightAlign = (text: string, width: number): string => {
	const padding = Math.max(0, width - text.length);
	return " ".repeat(padding) + text;
};

/**
 * Pad string to specific length (alias for pad)
 */
export const padEnd = pad;

/**
 * Convert string to camelCase
 */
export const camelCase = (str: string): string => {
	return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
};
