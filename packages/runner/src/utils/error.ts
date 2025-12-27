import type { RunnerError } from "../types";

/**
 * Create a RunnerError
 */
export const createRunnerError = (options: {
	readonly command: string;
	readonly exitCode: number | null;
	readonly stdout: string;
	readonly stderr: string;
	readonly signal: NodeJS.Signals | null;
	readonly timedOut: boolean;
	readonly killed: boolean;
	readonly message?: string;
}): RunnerError => {
	const error = new Error(
		options.message
			|| `Command failed with exit code ${options.exitCode}: ${options.command}`,
	) as RunnerError;

	error.name = "RunnerError";
	error.command = options.command;
	error.exitCode = options.exitCode;
	error.stdout = options.stdout;
	error.stderr = options.stderr;
	error.signal = options.signal;
	error.timedOut = options.timedOut;
	error.killed = options.killed;

	return error;
};

/**
 * Format error message
 */
export const formatErrorMessage = (error: RunnerError): string => {
	const parts: string[] = [];

	parts.push(`Command: ${error.command}`);

	if (error.exitCode !== null) {
		parts.push(`Exit code: ${error.exitCode}`);
	}

	if (error.signal) {
		parts.push(`Signal: ${error.signal}`);
	}

	if (error.timedOut) {
		parts.push("Timed out: true");
	}

	if (error.killed) {
		parts.push("Killed: true");
	}

	if (error.stderr) {
		parts.push(`\nStderr:\n${error.stderr}`);
	}

	if (error.stdout) {
		parts.push(`\nStdout:\n${error.stdout}`);
	}

	return parts.join("\n");
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: unknown): error is RunnerError =>
	error instanceof Error
	&& error.name === "RunnerError"
	&& (error as RunnerError).timedOut === true;

/**
 * Check if error is a signal error
 */
export const isSignalError = (error: unknown): error is RunnerError =>
	error instanceof Error
	&& error.name === "RunnerError"
	&& (error as RunnerError).signal !== null;

/**
 * Check if error is a non-zero exit code error
 */
export const isExitCodeError = (error: unknown): error is RunnerError =>
	error instanceof Error
	&& error.name === "RunnerError"
	&& (error as RunnerError).exitCode !== null
	&& (error as RunnerError).exitCode !== 0;
