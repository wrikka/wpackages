import { execa } from "execa";

/**
 * Execute command safely with error handling
 */
export async function executeCommand(
	command: string,
	args: string[],
	options?: Record<string, unknown>,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
	try {
		const result = await execa(command, args, {
			...options,
			reject: false,
		});
		return {
			exitCode: result.exitCode ?? 0,
			stdout: result.stdout,
			stderr: result.stderr,
		};
	} catch (error) {
		return {
			exitCode: 1,
			stdout: "",
			stderr: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute command and throw on error
 */
export async function executeCommandStrict(
	command: string,
	args: string[],
	options?: Record<string, unknown>,
): Promise<string> {
	const result = await execa(command, args, options);
	return result.stdout;
}

/**
 * Check if command succeeded
 */
export function isCommandSuccess(exitCode: number): boolean {
	return exitCode === 0;
}

/**
 * Parse command output lines
 */
export function parseOutputLines(output: string): string[] {
	return output.split("\n").filter(Boolean);
}

/**
 * Parse command output with separator
 */
export function parseOutputWithSeparator(output: string, separator: string): string[][] {
	return parseOutputLines(output).map((line) => line.split(separator));
}
