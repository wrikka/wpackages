/**
 * Batch processing constants
 */

/**
 * Default batch size
 */
export const DEFAULT_BATCH_SIZE = 100;

/**
 * Maximum batch size
 */
export const MAX_BATCH_SIZE = 1000;

/**
 * Default batch wait time (ms)
 */
export const DEFAULT_BATCH_WAIT_MS = 100;

/**
 * Default batch concurrency
 */
export const DEFAULT_BATCH_CONCURRENCY = 5;

/**
 * Batch strategies
 */
export const BATCH_STRATEGIES = {
	ADAPTIVE: "adaptive",
	DELAYED: "delayed",
	IMMEDIATE: "immediate",
} as const;
