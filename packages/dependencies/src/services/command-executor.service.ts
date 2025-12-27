import { Effect } from "effect";
import type { PackageManager } from "../types/index";

/**
 * Command execution result
 */
export interface CommandResult {
	readonly exitCode: number;
	readonly stdout: string;
	readonly stderr: string;
}

/**
 * Execute a command with the package manager
 * @param manager - Package manager to use
 * @param args - Command arguments
 * @param cwd - Current working directory
 * @param silent - Whether to capture output instead of inheriting
 * @returns Effect that executes the command and returns the result
 * @throws Error if command exits with non-zero code
 */
export function executeCommand(
	manager: PackageManager,
	args: readonly string[],
	cwd: string,
	silent = false,
): Effect.Effect<CommandResult, Error> {
	return Effect.tryPromise(async () => {
		const proc = Bun.spawn([manager, ...args], {
			cwd,
			stdout: silent ? "pipe" : "inherit",
			stderr: silent ? "pipe" : "inherit",
		});

		const exitCode = await proc.exited;

		let stdout = "";
		let stderr = "";

		if (silent && proc.stdout) {
			stdout = await new Response(proc.stdout).text();
		}

		if (silent && proc.stderr) {
			stderr = await new Response(proc.stderr).text();
		}

		if (exitCode !== 0) {
			throw new Error(`Command failed with exit code ${exitCode}: ${manager} ${args.join(" ")}`);
		}

		return {
			exitCode,
			stdout,
			stderr,
		};
	});
}

/**
 * Execute command and return stdout
 */
export function executeCommandForOutput(
	manager: PackageManager,
	args: readonly string[],
	cwd: string,
): Effect.Effect<string, Error> {
	return Effect.map(executeCommand(manager, args, cwd, true), (result: CommandResult) => result.stdout);
}

/**
 * Execute command silently (ignore output)
 */
export function executeCommandSilent(
	manager: PackageManager,
	args: readonly string[],
	cwd: string,
): Effect.Effect<void, Error> {
	return Effect.map(executeCommand(manager, args, cwd, true), () => {});
}
