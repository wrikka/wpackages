/**
 * Unified git command execution
 */

import { execa } from "execa";
import { formatErrorMessage } from "./error-handler";

/**
 * Execute git command
 */
export const executeGitCommand = async (
	args: string[],
	options?: { reject?: boolean },
): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
	try {
		const result = await execa("git", args, {
			reject: options?.reject ?? true,
		});
		return {
			exitCode: result.exitCode ?? 0,
			stdout: result.stdout,
			stderr: result.stderr || "",
		};
	} catch (error) {
		const message = formatErrorMessage(error);
		throw new Error(`Git command failed: ${message}`);
	}
};

/**
 * Execute git command safely (no throw)
 */
export const executeGitCommandSafe = async (
	args: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
	try {
		const result = await execa("git", args, { reject: false });
		return {
			exitCode: result.exitCode ?? 0,
			stdout: result.stdout,
			stderr: result.stderr || "",
		};
	} catch (error) {
		return {
			exitCode: 1,
			stdout: "",
			stderr: formatErrorMessage(error),
		};
	}
};

/**
 * Check git command success
 */
export const isGitCommandSuccess = (exitCode: number): boolean => exitCode === 0;

/**
 * Parse git output lines
 */
export const parseGitOutputLines = (output: string): string[] => output.split("\n").filter(Boolean);

/**
 * Parse git log output with separator
 */
export const parseGitLogOutput = (
	output: string,
	separator: string,
): string[][] => {
	if (!output) return [];
	return parseGitOutputLines(output).map((line) => line.split(separator));
};
