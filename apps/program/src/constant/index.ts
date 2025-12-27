/**
 * Constants
 *
 * ค่าคงที่ที่ใช้ทั่วทั้งระบบ
 */

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = Object.freeze({
	maxAttempts: 3,
	delay: 1000,
	backoff: "exponential" as const,
});

/**
 * Default timeout in milliseconds
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG = Object.freeze({
	threshold: 5,
	timeout: 60000,
	halfOpenAttempts: 3,
});

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG = Object.freeze({
	requests: 100,
	window: 60000,
	strategy: "sliding" as const,
});

/**
 * Default bulkhead configuration
 */
export const DEFAULT_BULKHEAD_CONFIG = Object.freeze({
	maxConcurrent: 10,
	maxQueue: 20,
});

/**
 * Default debounce delay
 */
export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Default throttle delay
 */
export const DEFAULT_THROTTLE_MS = 1000;
