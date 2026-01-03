import type { RunnerOptions, RunnerResult, StreamHandler } from "../types";
import { normalizeOptions, parseEnv, stripFinalNewline } from "./parse";
import { buildPath } from "./parse";

/**
 * Build command string from options
 */
export const buildCommandString = (options: RunnerOptions): string => {
	return `${options.command} ${options.args?.join(" ") ?? ""}`;
};

/**
 * Setup environment variables
 */
export const setupEnv = (
	options: RunnerOptions,
	normalized: ReturnType<typeof normalizeOptions>,
): Record<string, string> => {
	const env = parseEnv(options.env);

	if (normalized.preferLocal) {
		env["PATH"] = buildPath({
			preferLocal: true,
			...(options.localDir !== undefined && { localDir: options.localDir }),
			...(options.cwd !== undefined && { cwd: options.cwd }),
		});
	}

	return env;
};

/**
 * Process output strings (strip newlines if needed)
 */
export const processOutput = (
	stdout: string,
	stderr: string,
	normalized: ReturnType<typeof normalizeOptions>,
): { stdout: string; stderr: string } => {
	if (normalized.stripFinalNewline) {
		return {
			stdout: stripFinalNewline(stdout),
			stderr: stripFinalNewline(stderr),
		};
	}
	return { stdout, stderr };
};

/**
 * Create result from execution data
 */
export const createExecutionResult = (
	options: RunnerOptions,
	exitCode: number | null,
	stdout: string,
	stderr: string,
	signal: NodeJS.Signals | null,
	duration: number,
	killed: boolean,
	timedOut: boolean,
	normalized: ReturnType<typeof normalizeOptions>,
): RunnerResult => {
	const { stdout: processedStdout, stderr: processedStderr } = processOutput(stdout, stderr, normalized);

	return {
		command: buildCommandString(options),
		exitCode,
		stdout: processedStdout,
		stderr: processedStderr,
		output: processedStdout + processedStderr,
		success: exitCode === 0 && signal === null,
		signal,
		duration,
		killed,
		timedOut,
	};
};

/**
 * Handle stream data with handlers and verbose mode
 */
export const handleStreamData = (
	chunk: Buffer,
	encoding: BufferEncoding,
	isStderr: boolean,
	handler: StreamHandler | undefined,
	verbose: boolean,
	onData: (data: string) => void,
): void => {
	const data = chunk.toString(encoding);
	onData(data);

	if (isStderr) {
		handler?.onStderr?.(data);
	} else {
		handler?.onStdout?.(data);
	}

	handler?.onOutput?.(data);

	if (verbose) {
		if (isStderr) {
			process.stderr.write(data);
		} else {
			process.stdout.write(data);
		}
	}
};
