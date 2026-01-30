import { example1_basicRetry } from "./basic-retry.usage";
import { example11_chainingRetries } from "./chaining-retries.usage";
import { example2_customMaxAttempts } from "./custom-max-attempts.usage";
import { example9_databaseConnection } from "./database-connection.usage";
import { example3_exponentialBackoff } from "./exponential-backoff.usage";
import { example5_fixedBackoff } from "./fixed-backoff.usage";
import { example4_linearBackoff } from "./linear-backoff.usage";
import { example8_maxDelayCap } from "./max-delay-cap.usage";
import { example7_onRetryCallback } from "./on-retry-callback.usage";
import { example10_retryPolicy } from "./retry-policy.usage";
import { example12_retryWithTimeout } from "./retry-with-timeout.usage";
import { example6_shouldRetryPredicate } from "./should-retry-predicate.usage";

export const runRetryUsageExamples = async () => {
	await example1_basicRetry();
	await example2_customMaxAttempts();
	await example3_exponentialBackoff();
	await example4_linearBackoff();
	await example5_fixedBackoff();
	await example6_shouldRetryPredicate();
	await example7_onRetryCallback();
	await example8_maxDelayCap();
	await example9_databaseConnection();
	await example10_retryPolicy();
	await example11_chainingRetries();
	await example12_retryWithTimeout();
};

export {
	example10_retryPolicy,
	example11_chainingRetries,
	example12_retryWithTimeout,
	example1_basicRetry,
	example2_customMaxAttempts,
	example3_exponentialBackoff,
	example4_linearBackoff,
	example5_fixedBackoff,
	example6_shouldRetryPredicate,
	example7_onRetryCallback,
	example8_maxDelayCap,
	example9_databaseConnection,
};
