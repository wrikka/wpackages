import { execSync, spawn } from "node:child_process";
import type { Result, RunnerError, RunnerOptions, RunnerResult, StreamHandler } from "../types";
import { err, ok } from "../types/result";
import { createRunnerError } from "./error";
import { buildPath, normalizeOptions, parseEnv, stripFinalNewline } from "./parse";

/**
 * Execute a command
 */
export const execute = async (
	options: RunnerOptions,
): Promise<Result<RunnerResult, RunnerError>> => {
	const normalized = normalizeOptions(options);
	const startTime = Date.now();

	// Dry run mode
	if (normalized.dryRun) {
		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
		console.log(`[DRY RUN] Would execute: ${commandStr}`);
		return ok({
			command: commandStr,
			exitCode: 0,
			stdout: "",
			stderr: "",
			output: "",
			success: true,
			signal: null,
			duration: 0,
			killed: false,
			timedOut: false,
		});
	}

	return new Promise((resolve) => {
		const env = parseEnv(options.env);

		// Update PATH if preferLocal
		if (normalized.preferLocal) {
			env["PATH"] = buildPath({
				preferLocal: true,
				...(options.localDir !== undefined && { localDir: options.localDir }),
				...(options.cwd !== undefined && { cwd: options.cwd }),
			});
		}

		// Spawn process
		const child: any = spawn(options.command, options.args ?? [], {
			cwd: options.cwd,
			env,
			shell: options.shell ?? false,
			signal: options.signal,
			stdio: normalized.inheritStdio
				? "inherit"
				: [normalized.stdin as any, normalized.stdout as any, normalized.stderr as any],
			killSignal: options.killSignal,
		});

		let stdout = "";
		let stderr = "";
		let timedOut = false;
		let timeoutId: NodeJS.Timeout | undefined;

		// Set timeout
		if (options.timeout) {
			timeoutId = setTimeout(() => {
				timedOut = true;
				child.kill(options.killSignal ?? "SIGTERM");
			}, options.timeout);
		}

		// Collect stdout
		if (child.stdout) {
			child.stdout.on("data", (chunk: Buffer) => {
				const data = chunk.toString(normalized.encoding);
				stdout += data;

				if (normalized.verbose) {
					process.stdout.write(data);
				}
			});
		}

		// Collect stderr
		if (child.stderr) {
			child.stderr.on("data", (chunk: Buffer) => {
				const data = chunk.toString(normalized.encoding);
				stderr += data;

				if (normalized.verbose) {
					process.stderr.write(data);
				}
			});
		}

		// Handle stdin input
		if (options.input && child.stdin) {
			child.stdin.write(options.input);
			child.stdin.end();
		}

		// Handle exit
		child.on(
			"close",
			(exitCode: number | null, signal: NodeJS.Signals | null) => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				const duration = Date.now() - startTime;

				// Strip final newline if needed
				if (normalized.stripFinalNewline) {
					stdout = stripFinalNewline(stdout);
					stderr = stripFinalNewline(stderr);
				}

				const result: RunnerResult = {
					command: `${options.command} ${options.args?.join(" ") ?? ""}`,
					exitCode,
					stdout,
					stderr,
					output: stdout + stderr,
					success: exitCode === 0 && signal === null,
					signal,
					duration,
					killed: child.killed || signal !== null,
					timedOut,
				};

				// Check if should reject on error
				if (
					normalized.rejectOnError
					&& (exitCode !== 0 || signal !== null || timedOut)
				) {
					const error = createRunnerError({
						command: result.command,
						exitCode,
						stdout,
						stderr,
						signal,
						timedOut,
						killed: result.killed,
					});

					resolve(err(error));
				} else {
					resolve(ok(result));
				}
			},
		);

		// Handle error
		child.on("error", (error: Error) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			const runnerError = createRunnerError({
				command: `${options.command} ${options.args?.join(" ") ?? ""}`,
				exitCode: null,
				stdout,
				stderr: error.message,
				signal: null,
				timedOut,
				killed: false,
				message: error.message,
			});

			resolve(err(runnerError));
		});
	});
};

/**
 * Execute with streaming output
 */
export const executeStream = async (
	options: RunnerOptions,
	handler: StreamHandler,
): Promise<Result<RunnerResult, RunnerError>> => {
	const normalized = normalizeOptions(options);
	const startTime = Date.now();

	if (normalized.dryRun) {
		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
		console.log(`[DRY RUN] Would execute: ${commandStr}`);
		return ok({
			command: commandStr,
			exitCode: 0,
			stdout: "",
			stderr: "",
			output: "",
			success: true,
			signal: null,
			duration: 0,
			killed: false,
			timedOut: false,
		});
	}

	return new Promise((resolve) => {
		const env = parseEnv(options.env);

		if (normalized.preferLocal) {
			env["PATH"] = buildPath({
				preferLocal: true,
				...(options.localDir !== undefined && { localDir: options.localDir }),
				...(options.cwd !== undefined && { cwd: options.cwd }),
			});
		}

		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;

		const child: any = spawn(options.command, options.args ?? [], {
			cwd: options.cwd,
			env,
			shell: options.shell ?? false,
			signal: options.signal,
			stdio: ["pipe", "pipe", "pipe"],
			killSignal: options.killSignal,
		});

		let stdout = "";
		let stderr = "";
		let timedOut = false;
		let timeoutId: NodeJS.Timeout | undefined;

		if (options.timeout) {
			timeoutId = setTimeout(() => {
				timedOut = true;
				child.kill(options.killSignal ?? "SIGTERM");
			}, options.timeout);
		}

		if (child.stdout) {
			child.stdout.on("data", (chunk: Buffer) => {
				const data = chunk.toString(normalized.encoding);
				stdout += data;
				handler.onStdout?.(data);
				handler.onOutput?.(data);
			});
		}

		if (child.stderr) {
			child.stderr.on("data", (chunk: Buffer) => {
				const data = chunk.toString(normalized.encoding);
				stderr += data;
				handler.onStderr?.(data);
				handler.onOutput?.(data);
			});
		}

		if (options.input && child.stdin) {
			child.stdin.write(options.input);
			child.stdin.end();
		}

		child.on(
			"close",
			(exitCode: number | null, signal: NodeJS.Signals | null) => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				const duration = Date.now() - startTime;

				if (normalized.stripFinalNewline) {
					stdout = stripFinalNewline(stdout);
					stderr = stripFinalNewline(stderr);
				}

				const result: RunnerResult = {
					command: commandStr,
					exitCode,
					stdout,
					stderr,
					output: stdout + stderr,
					success: exitCode === 0 && signal === null,
					signal,
					duration,
					killed: child.killed || signal !== null,
					timedOut,
				};

				if (
					normalized.rejectOnError
					&& (exitCode !== 0 || signal !== null || timedOut)
				) {
					const error = createRunnerError({
						command: result.command,
						exitCode,
						stdout,
						stderr,
						signal,
						timedOut,
						killed: result.killed,
					});

					resolve(err(error));
				} else {
					resolve(ok(result));
				}
			},
		);

		child.on("error", (error: Error) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			const runnerError = createRunnerError({
				command: commandStr,
				exitCode: null,
				stdout,
				stderr: error.message,
				signal: null,
				timedOut,
				killed: false,
				message: error.message,
			});

			resolve(err(runnerError));
		});
	});
};

/**
 * Execute synchronously (for simple cases)
 */
export const executeSync = (
	options: RunnerOptions,
): Result<RunnerResult, RunnerError> => {
	// Note: This is a simplified sync version using Bun's native sync execution
	// For Node.js, you'd use execSync from child_process
	const normalized = normalizeOptions(options);
	const startTime = Date.now();

	// Dry run mode
	if (normalized.dryRun) {
		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
		console.log(`[DRY RUN] Would execute: ${commandStr}`);
		return ok({
			command: commandStr,
			exitCode: 0,
			stdout: "",
			stderr: "",
			output: "",
			success: true,
			signal: null,
			duration: 0,
			killed: false,
			timedOut: false,
		});
	}

	try {
		const env = parseEnv(options.env);

		if (normalized.preferLocal) {
			env["PATH"] = buildPath({
				preferLocal: true,
				...(options.localDir !== undefined && { localDir: options.localDir }),
				...(options.cwd !== undefined && { cwd: options.cwd }),
			});
		}

		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;

		const result = execSync(commandStr, {
			cwd: options.cwd,
			env,
			encoding: normalized.encoding,
			shell: typeof options.shell === "string" ? options.shell : undefined,
			timeout: options.timeout,
			maxBuffer: options.maxBuffer,
			killSignal: options.killSignal,
			input: options.input,
		});

		const duration = Date.now() - startTime;
		let stdout = result.toString();

		if (normalized.stripFinalNewline) {
			stdout = stripFinalNewline(stdout);
		}

		return ok({
			command: commandStr,
			exitCode: 0,
			stdout,
			stderr: "",
			output: stdout,
			success: true,
			signal: null,
			duration,
			killed: false,
			timedOut: false,
		});
	} catch (error: unknown) {
		const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
		if (error instanceof Error && "status" in error) {
			const runnerError = createRunnerError({
				command: commandStr,
				exitCode: (error as any).status ?? null,
				stdout: (error as any).stdout?.toString() ?? "",
				stderr: (error as any).stderr?.toString() ?? "",
				signal: (error as any).signal ?? null,
				timedOut: false,
				killed: (error as any).killed ?? false,
				message: error.message,
			});
			return err(runnerError);
		} else if (error instanceof Error) {
			return err(
				createRunnerError({
					command: commandStr,
					message: error.message,
					exitCode: 1,
					stdout: "",
					stderr: "",
					signal: null,
					timedOut: false,
					killed: false,
				}),
			);
		}
		return err(
			createRunnerError({
				command: commandStr,
				message: "An unknown error occurred",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			}),
		);
	}
};
