/**
 * Default values for runner options
 */
export const RUNNER_DEFAULTS = {
	encoding: "utf8" as const,
	stripFinalNewline: true,
	preferLocal: true,
	rejectOnError: true,
	stdout: "pipe" as const,
	stderr: "pipe" as const,
	stdin: "pipe" as const,
	verbose: false,
	dryRun: false,
	inheritStdio: false,
} as const;

/**
 * Default retry options
 */
export const RETRY_DEFAULTS = {
	retries: 3,
	retryDelay: 1000,
	backoffFactor: 2,
	maxDelay: 30000,
} as const;

/**
 * Default timeout values (in milliseconds)
 */
export const TIMEOUT_DEFAULTS = {
	short: 5000,
	normal: 30000,
	long: 120000,
} as const;

/**
 * Common exit codes
 */
export const EXIT_CODES = {
	success: 0,
	generalError: 1,
	misuse: 2,
	notFound: 127,
	timeout: 124,
} as const;

/**
 * Network-related exit codes
 */
export const NETWORK_EXIT_CODES: readonly number[] = [6, 7, 28, 35, 56];

/**
 * Signal names
 */
export const SIGNALS = {
	SIGTERM: "SIGTERM",
	SIGKILL: "SIGKILL",
	SIGINT: "SIGINT",
} as const;
