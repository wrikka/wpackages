import type { PipeOptions, Result, RunnerError, RunnerResult, RunnerOptions } from "../types";
import { err, isErr, ok } from "../types/result";
import { createRunnerError } from "./error";
import { execute } from "./execute";

/**
 * Execute commands in a pipe chain
 */
export const executePipe = async (
	options: PipeOptions,
): Promise<Result<RunnerResult, RunnerError>> => {
	const { commands, timeout, signal, failFast = true } = options;

	if (commands.length === 0) {
		return err(
			createRunnerError({
				command: "pipe",
				exitCode: 1,
				stdout: "",
				stderr: "No commands provided",
				signal: null,
				timedOut: false,
				killed: false,
				message: "Pipe requires at least one command",
			}),
		);
	}

	const startTime = Date.now();
	let previousOutput = "";
	const results: RunnerResult[] = [];

	// Overall timeout handling
	let timedOut = false;
	let timeoutId: NodeJS.Timeout | undefined;

	if (timeout) {
		timeoutId = setTimeout(() => {
			timedOut = true;
		}, timeout);
	}

	try {
		for (let i = 0; i < commands.length; i++) {
			if (timedOut) {
				return err(
					createRunnerError({
						command: "pipe",
						exitCode: null,
						stdout: previousOutput,
						stderr: "Pipe timed out",
						signal: signal?.aborted ? "SIGTERM" : null,
						timedOut: true,
						killed: true,
						message: `Pipe timed out after ${timeout}ms`,
					}),
				);
			}

			const command = commands[i];
			if (!command) continue;

			// Use previous output as input for next command
			const executeOptions: RunnerOptions = {
				...command,
				command: command.command,
			};
			if (i > 0) {
				executeOptions.input = previousOutput;
			} else if (command.input) {
				executeOptions.input = command.input;
			}
			if (signal) {
				executeOptions.signal = signal;
			}
			const result = await execute(executeOptions);

			if (isErr(result)) {
				if (failFast) {
					return result;
				}
				// Continue with empty output if not failing fast
				results.push({
					command: result.error.command,
					exitCode: result.error.exitCode,
					stdout: result.error.stdout,
					stderr: result.error.stderr,
					output: result.error.stdout + result.error.stderr,
					success: false,
					signal: result.error.signal,
					duration: 0,
					killed: result.error.killed,
					timedOut: result.error.timedOut,
				});
			} else {
				results.push(result.value);
				previousOutput = result.value.stdout;
			}
		}

		const duration = Date.now() - startTime;

		// Combine all results
		const combinedStdout = results.map((r) => r.stdout).join("\n");
		const combinedStderr = results.map((r) => r.stderr).join("\n");
		const allSuccess = results.every((r) => r.success);

		const finalResult: RunnerResult = {
			command: `pipe(${commands.length} commands)`,
			exitCode: allSuccess ? 0 : 1,
			stdout: combinedStdout,
			stderr: combinedStderr,
			output: combinedStdout + combinedStderr,
			success: allSuccess,
			signal: null,
			duration,
			killed: false,
			timedOut: false,
		};

		return ok(finalResult);
	} finally {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	}
};

/**
 * Create a pipe from command options
 */
export const pipe = (
	...commands: readonly RunnerOptions[]
): PipeOptions => ({
	commands,
	failFast: true,
});

/**
 * Create a pipe with custom options
 */
export const pipeWithOptions = (
	commands: readonly RunnerOptions[],
	options: Omit<PipeOptions, "commands">,
): PipeOptions => ({
	...options,
	commands,
});
