import { Effect } from "effect";
import type { Script, ScriptResult } from "../types";

/**
 * Advanced script runner with timeout, retry, and dry-run support
 */

/**
 * Execute a script with timeout support
 */
export const executeScriptWithTimeout = (
	command: string,
	timeout: number,
	options: { shell?: boolean; cwd?: string; env?: Record<string, string> } = {},
): Effect.Effect<{ stdout: string; stderr: string }, Error> => {
	return Effect.gen(function*() {
		const { spawn } = require("node:child_process");

		const result = yield* Effect.promise(
			() =>
				new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
					const child = spawn(command, {
						shell: options.shell ?? true,
						cwd: options.cwd,
						env: options.env,
					});

					let stdout = "";
					let stderr = "";
					let timedOut = false;

					const timeoutId = setTimeout(() => {
						timedOut = true;
						child.kill();
						reject(new Error(`Script execution timeout after ${timeout}ms`));
					}, timeout);

					child.stdout?.on("data", (data: Buffer) => {
						stdout += data.toString();
					});

					child.stderr?.on("data", (data: Buffer) => {
						stderr += data.toString();
					});

					child.on("close", (code: number) => {
						clearTimeout(timeoutId);

						if (timedOut) return;

						if (code === 0) {
							resolve({ stdout, stderr });
						} else {
							reject(
								new Error(`Script exited with code ${code}: ${stderr}`),
							);
						}
					});

					child.on("error", (error: Error) => {
						clearTimeout(timeoutId);
						reject(error);
					});
				}),
		);

		return result;
	});
};

/**
 * Execute a script with retry support
 */
export const executeScriptWithRetry = (
	command: string,
	maxRetries: number = 3,
	retryDelay: number = 1000,
	options: { shell?: boolean; cwd?: string; env?: Record<string, string> } = {},
): Effect.Effect<{ stdout: string; stderr: string }, Error> => {
	return Effect.gen(function*() {
		const { spawn } = require("node:child_process");

		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const result = yield* Effect.promise(
					() =>
						new Promise<{ stdout: string; stderr: string }>(
							(resolve, reject) => {
								const child = spawn(command, {
									shell: options.shell ?? true,
									cwd: options.cwd,
									env: options.env,
								});

								let stdout = "";
								let stderr = "";

								child.stdout?.on("data", (data: Buffer) => {
									stdout += data.toString();
								});

								child.stderr?.on("data", (data: Buffer) => {
									stderr += data.toString();
								});

								child.on("close", (code: number) => {
									if (code === 0) {
										resolve({ stdout, stderr });
									} else {
										reject(
											new Error(`Script exited with code ${code}: ${stderr}`),
										);
									}
								});

								child.on("error", (error: Error) => {
									reject(error);
								});
							},
						),
				);

				return result;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt < maxRetries) {
					// Wait before retrying
					yield* Effect.sleep(retryDelay);
				}
			}
		}

		return yield* Effect.fail(
			lastError || new Error("Script execution failed after retries"),
		);
	});
};

/**
 * Dry-run mode - simulate script execution without actually running it
 */
export const dryRunScript = (script: Script): ScriptResult => {
	const startTime = Date.now();
	const duration = Date.now() - startTime;

	return {
		name: script.name,
		success: true,
		output: `[DRY RUN] Would execute: ${script.command}${script.cwd ? ` in ${script.cwd}` : ""}`,
		duration,
	};
};

/**
 * Validate script configuration for advanced options
 */
export const validateAdvancedScriptConfig = (script: Script): string[] => {
	const errors: string[] = [];

	if (script.timeout !== undefined && script.timeout <= 0) {
		errors.push(`Invalid timeout for ${script.name}: must be greater than 0`);
	}

	if (script.retries !== undefined && script.retries < 0) {
		errors.push(`Invalid retries for ${script.name}: must be non-negative`);
	}

	if (script.retryDelay !== undefined && script.retryDelay < 0) {
		errors.push(`Invalid retryDelay for ${script.name}: must be non-negative`);
	}

	return errors;
};

/**
 * Format script execution info with advanced options
 */
export const formatScriptExecutionInfo = (script: Script): string => {
	const lines: string[] = [];

	lines.push(`Script: ${script.name}`);

	if (script.description) {
		lines.push(`Description: ${script.description}`);
	}

	lines.push(`Command: ${script.command}`);

	if (script.timeout) {
		lines.push(`Timeout: ${script.timeout}ms`);
	}

	if (script.retries) {
		lines.push(`Retries: ${script.retries}`);
	}

	if (script.retryDelay) {
		lines.push(`Retry Delay: ${script.retryDelay}ms`);
	}

	if (script.dryRun) {
		lines.push("Mode: DRY RUN");
	}

	if (script.continueOnError) {
		lines.push("Continue on Error: true");
	}

	return lines.join("\n");
};
