/**
 * Retry Strategy Usage Examples
 */

import {
	calculateBackoffDelay,
	calculateBackoffWithJitter,
	calculateLinearBackoff,
	shouldRetry,
	createRetryAttempts,
	getRetryMetadata,
	isRetryableError,
	DEFAULT_RETRY_CONFIG,
	type RetryConfig,
} from "./retry-strategy";

// Example 1: Use default retry config
console.log("Default config:", DEFAULT_RETRY_CONFIG);

// Example 2: Calculate exponential backoff
const delays = [1, 2, 3].map((attempt) =>
	calculateBackoffDelay(attempt, DEFAULT_RETRY_CONFIG),
);
console.log("Exponential backoff delays:", delays); // [1000, 2000, 4000]

// Example 3: Add jitter to prevent thundering herd
const delaysWithJitter = [1, 2, 3].map((attempt) =>
	calculateBackoffWithJitter(attempt, DEFAULT_RETRY_CONFIG),
);
console.log("Delays with jitter:", delaysWithJitter);

// Example 4: Linear backoff alternative
const linearDelays = [1, 2, 3].map((attempt) =>
	calculateLinearBackoff(attempt, DEFAULT_RETRY_CONFIG),
);
console.log("Linear backoff delays:", linearDelays); // [1000, 2000, 3000]

// Example 5: Check if should retry
const timeoutError = new Error("Request timeout");
console.log("Should retry timeout?", shouldRetry(timeoutError, 1, DEFAULT_RETRY_CONFIG)); // true
console.log("Should retry on last attempt?", shouldRetry(timeoutError, 3, DEFAULT_RETRY_CONFIG)); // false

// Example 6: Create retry attempts
const attempts = createRetryAttempts(DEFAULT_RETRY_CONFIG);
console.log("Retry attempts:", attempts); // [1, 2, 3]

// Example 7: Get retry metadata
const metadata = getRetryMetadata(2, DEFAULT_RETRY_CONFIG);
console.log("Retry metadata:", metadata);
// {
//   attempt: 2,
//   maxAttempts: 3,
//   delay: 2000,
//   isLastAttempt: false
// }

// Example 8: Check if error is retryable
console.log("Is timeout retryable?", isRetryableError(new Error("timeout"))); // true
console.log("Is 503 retryable?", isRetryableError(new Error("503 Service Unavailable"))); // true
console.log("Is 404 retryable?", isRetryableError(new Error("404 not found"))); // false

// Example 9: Custom retry config
const aggressiveConfig: RetryConfig = {
	maxAttempts: 5,
	initialDelayMs: 500,
	maxDelayMs: 5000,
	backoffMultiplier: 1.5,
};

const aggressiveDelays = [1, 2, 3, 4, 5].map((attempt) =>
	calculateBackoffDelay(attempt, aggressiveConfig),
);
console.log("Aggressive retry delays:", aggressiveDelays);

// Example 10: Retry loop simulation
const simulateRetry = async (
	operation: () => Promise<string>,
	config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<string> => {
	let lastError: Error | null = null;

	for (const attempt of createRetryAttempts(config)) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (!shouldRetry(lastError, attempt, config)) {
				throw lastError;
			}

			const metadata = getRetryMetadata(attempt, config);
			console.log(
				`Attempt ${metadata.attempt} failed, retrying in ${metadata.delay}ms...`,
			);

			// In real code, you would await the delay
			// await new Promise(resolve => setTimeout(resolve, metadata.delay));
		}
	}

	throw lastError || new Error("Unknown error");
};

// Example usage
const mockOperation = async () => {
	if (Math.random() < 0.7) {
		throw new Error("timeout");
	}
	return "Success!";
};

simulateRetry(mockOperation)
	.then((result) => console.log("Operation result:", result))
	.catch((error) => console.error("Operation failed:", error.message));
