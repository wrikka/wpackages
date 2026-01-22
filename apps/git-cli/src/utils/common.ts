/**
 * Common utility functions used across commands
 */

import { execa } from "execa";

/**
 * Execute a git command and return stdout
 * @param command - Git command arguments
 * @returns Promise with stdout
 */
export async function runGitCommand(command: string[]): Promise<string> {
	const { stdout } = await execa("git", command);
	return stdout;
}

/**
 * Execute a git command safely, returning empty string on error
 * @param command - Git command arguments
 * @returns Promise with stdout or empty string
 */
export async function runGitCommandSafe(command: string[]): Promise<string> {
	try {
		return await runGitCommand(command);
	} catch {
		return "";
	}
}

/**
 * Get type description for conventional commits
 * @param type - Commit type
 * @returns Description of the commit type
 */
export function getTypeDescription(type: string): string {
	const descriptions: Record<string, string> = {
		feat: "A new feature",
		fix: "A bug fix",
		docs: "Documentation changes",
		style: "Code style changes (formatting, etc.)",
		refactor: "Code refactoring",
		test: "Adding or updating tests",
		chore: "Maintenance tasks",
		perf: "Performance improvements",
	};
	return descriptions[type] || "Other changes";
}
