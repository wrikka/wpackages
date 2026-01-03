/**
 * Pure functions for Git command execution and utilities
 */

/**
 * Parse git status output into lines
 * @param output - Git status output
 * @returns Array of non-empty lines
 */
export function parseGitOutput(output: string): string[] {
	return output.split("\n").filter(Boolean);
}

/**
 * Check if a value is a clack symbol (user cancelled)
 * @param value - Value to check
 * @returns True if value is a symbol
 */
export function isClackSymbol(value: unknown): value is symbol {
	return typeof value === "symbol";
}
