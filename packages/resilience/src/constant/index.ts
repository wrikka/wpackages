/**
 * Resilience constants
 */

export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_CIRCUIT_BREAKER_THRESHOLD = 5;
export const DEFAULT_BULKHEAD_LIMIT = 10;
export const DEFAULT_RATE_LIMIT_RPS = 100;

export const CIRCUIT_BREAKER_STATES = {
	CLOSED: "closed" as const,
	OPEN: "open" as const,
	HALF_OPEN: "half-open" as const,
} as const;

export const RESILIENCE_ERRORS = {
	TIMEOUT: "TIMEOUT",
	CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",
	BULKHEAD_FULL: "BULKHEAD_FULL",
	RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
	RETRY_EXHAUSTED: "RETRY_EXHAUSTED",
} as const;
