import { NETWORK_EXIT_CODES, RETRY_DEFAULTS } from "../constant";
import type { Result, RetryOptions, RunnerError, RunnerOptions, RunnerResult } from "../types";
import { isErr } from "../types/result";
import { execute } from "./execute";

/**
 * Default retry predicate - retry on any error
 */
const defaultShouldRetry = (_error: RunnerError): boolean => true;

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (
	attempt: number,
	baseDelay: number,
	backoffFactor: number,
	maxDelay: number,
): number => {
	const delay = baseDelay * backoffFactor ** attempt;
	return Math.min(delay, maxDelay);
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute command with retry logic
 */
export const executeWithRetry = async (
	options: RunnerOptions,
	retryOptions: RetryOptions = {},
): Promise<Result<RunnerResult, RunnerError>> => {
	const {
		retries = RETRY_DEFAULTS.retries,
		retryDelay = RETRY_DEFAULTS.retryDelay,
		backoffFactor = RETRY_DEFAULTS.backoffFactor,
		maxDelay = RETRY_DEFAULTS.maxDelay,
		shouldRetry = defaultShouldRetry,
		onRetry,
	} = retryOptions;

	let lastError: RunnerError | undefined;
	let attempt = 0;

	while (attempt <= retries) {
		const result = await execute(options);

		// If successful, return immediately
		if (!isErr(result)) {
			return result;
		}

		lastError = result.error;

		// If this was the last attempt, break
		if (attempt === retries) {
			break;
		}

		// Check if should retry
		if (!shouldRetry(lastError, attempt)) {
			break;
		}

		// Call onRetry callback
		onRetry?.(lastError, attempt);

		// Calculate and wait for delay
		const delay = calculateDelay(attempt, retryDelay, backoffFactor, maxDelay);
		await sleep(delay);

		attempt++;
	}

	// Return the last error
	if (!lastError) {
		throw new Error("executeWithRetry failed without producing an error");
	}
	return { success: false, error: lastError };
};

/**
 * Retry predicate: retry on timeout
 */
export const retryOnTimeout = (error: RunnerError): boolean => error.timedOut;

/**
 * Retry predicate: retry on specific exit codes
 */
export const retryOnExitCodes = (exitCodes: readonly number[]) => (error: RunnerError): boolean =>
	error.exitCode !== null && exitCodes.includes(error.exitCode);

/**
 * Retry predicate: retry on network errors (common exit codes)
 */
export const retryOnNetworkError = (error: RunnerError): boolean => {
	return error.exitCode !== null && NETWORK_EXIT_CODES.includes(error.exitCode);
};

/**
 * Retry predicate: combine multiple predicates with AND
 */
export const retryAll =
	(...predicates: readonly ((error: RunnerError) => boolean)[]) => (error: RunnerError, _attempt: number): boolean =>
		predicates.every((predicate) => predicate(error));

/**
 * Retry predicate: combine multiple predicates with OR
 */
export const retryAny =
	(...predicates: readonly ((error: RunnerError) => boolean)[]) => (error: RunnerError, _attempt: number): boolean =>
		predicates.some((predicate) => predicate(error));

/**
 * Create a retry predicate with max attempts
 */
export const retryUntil = (
	maxAttempts: number,
	predicate: (error: RunnerError) => boolean = defaultShouldRetry,
) =>
(error: RunnerError, attempt: number): boolean => attempt < maxAttempts && predicate(error);
