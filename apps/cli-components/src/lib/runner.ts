import { execa } from "execa";

/**
 * Run a command and measure its execution time
 *
 * @param command - The command to execute
 * @param shell - The shell to use (e.g., "bash", "pwsh")
 * @returns The execution time in milliseconds
 * @throws If the command execution fails
 *
 * @example
 * ```ts
 * const time = await runCommand("npm run test", "bash");
 * console.log(`Execution took ${time}ms`);
 * ```
 */
export const runCommand = async (
	command: string,
	shell: string,
): Promise<number> => {
	const startTime = performance.now();
	await execa(shell, ["-c", command]);
	const endTime = performance.now();
	return endTime - startTime;
};
