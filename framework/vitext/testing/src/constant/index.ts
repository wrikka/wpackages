/**
 * Testing constants
 */

export const DEFAULT_TIMEOUT = 5000;
export const DEFAULT_RETRIES = 0;
export const DEFAULT_PARALLEL = true;

export const TEST_STATUS = {
	PASSED: "passed",
	FAILED: "failed",
	SKIPPED: "skipped",
	PENDING: "pending",
} as const;

export const ERROR_MESSAGES = {
	ASSERTION_FAILED: "Assertion failed",
	TIMEOUT: "Test timeout",
	HOOK_FAILED: "Hook failed",
	INVALID_CONFIG: "Invalid configuration",
} as const;
