import type { Result } from "./result";

/**
 * Runner execution options
 */
export interface RunnerOptions {
	/** Command to execute */
	command: string;
	/** Command arguments */
	args?: readonly string[];
	/** Working directory */
	cwd?: string;
	/** Environment variables */
	env?: Readonly<Record<string, string>>;
	/** Timeout in milliseconds */
	timeout?: number;
	/** Abort signal for cancellation */
	signal?: AbortSignal;
	/** Shell to use (true = default shell, string = custom shell) */
	shell?: boolean | string;
	/** Input to pipe to stdin */
	input?: string | Buffer | Uint8Array;
	/** Encoding for output */
	encoding?: BufferEncoding;
	/** Kill signal */
	killSignal?: NodeJS.Signals;
	/** Maximum buffer size for stdout/stderr */
	maxBuffer?: number;
	/** Inherit stdio from parent process */
	inheritStdio?: boolean;
	/** Capture stdout */
	stdout?: boolean | "pipe" | "ignore" | "inherit";
	/** Capture stderr */
	stderr?: boolean | "pipe" | "ignore" | "inherit";
	/** Capture stdin */
	stdin?: boolean | "pipe" | "ignore" | "inherit";
	/** Verbose mode for debugging */
	verbose?: boolean;
	/** Dry run mode (don't actually execute) */
	dryRun?: boolean;
	/** Strip final newline from output */
	stripFinalNewline?: boolean;
	/** Prefer local binaries in node_modules/.bin */
	preferLocal?: boolean;
	/** Path to local binaries */
	localDir?: string;
	/** Reject on non-zero exit code */
	rejectOnError?: boolean;
}

/**
 * Runner execution result
 */
export interface RunnerResult {
	/** Command that was executed */
	command: string;
	/** Exit code */
	exitCode: number | null;
	/** Standard output */
	stdout: string;
	/** Standard error */
	stderr: string;
	/** Combined output (stdout + stderr) */
	output: string;
	/** Whether command succeeded */
	success: boolean;
	/** Signal that terminated the process */
	signal: NodeJS.Signals | null;
	/** Execution time in milliseconds */
	duration: number;
	/** Whether command was killed */
	killed: boolean;
	/** Whether command timed out */
	timedOut: boolean;
}

/**
 * Runner error
 */
export interface RunnerError extends Error {
	name: "RunnerError";
	command: string;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	signal: NodeJS.Signals | null;
	timedOut: boolean;
	killed: boolean;
}

/**
 * Stream output handler
 */
export interface StreamHandler {
	onStdout?: (chunk: string) => void;
	onStderr?: (chunk: string) => void;
	onOutput?: (chunk: string) => void;
}

/**
 * Retry options
 */
export interface RetryOptions {
	/** Number of retry attempts */
	retries?: number;
	/** Retry delay in milliseconds */
	retryDelay?: number;
	/** Exponential backoff factor */
	backoffFactor?: number;
	/** Maximum delay between retries */
	maxDelay?: number;
	/** Predicate to determine if error should be retried */
	shouldRetry?: (error: RunnerError, attempt: number) => boolean;
	/** Callback on retry */
	onRetry?: (error: RunnerError, attempt: number) => void;
}

/**
 * Pipe options
 */
export interface PipeOptions {
	/** Commands to pipe together */
	commands: readonly RunnerOptions[];
	/** Overall timeout for entire pipe */
	timeout?: number;
	/** Abort signal for cancellation */
	signal?: AbortSignal;
	/** Fail fast on first error */
	failFast?: boolean;
}

/**
 * Process info
 */
export interface ProcessInfo {
	/** Process ID */
	pid: number;
	/** Command */
	command: string;
	/** Start time */
	startTime: number;
	/** CPU usage */
	cpu?: number;
	/** Memory usage in bytes */
	memory?: number;
}

/**
 * Runner configuration
 */
export interface RunnerConfig extends Partial<RunnerOptions> {
	/** Default shell */
	defaultShell?: string;
	/** Default timeout */
	defaultTimeout?: number;
	/** Default max buffer */
	defaultMaxBuffer?: number;
}

/**
 * Type guard for RunnerError
 */
export const isRunnerError = (error: unknown): error is RunnerError =>
	error instanceof Error && error.name === "RunnerError";

/**
 * Type guard for Result<RunnerResult, RunnerError>
 */
export const isRunnerResult = (
	result: Result<RunnerResult, RunnerError>,
): result is { success: true; value: RunnerResult } => result.success === true;
