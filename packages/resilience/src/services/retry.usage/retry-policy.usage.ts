import { createRetryPolicy, retry } from "../retry";

// Example 10: Using retry policy factory
export const example10_retryPolicy = async () => {
	const policy = createRetryPolicy({
		maxRetries: 5,
		retryDelay: 200,
		exponentialBackoff: true,
		maxDelay: 5000,
	});

	let attempts = 0;

	const apiCall = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("API error");
		}
		return { data: "response" };
	};

	const result = await retry(apiCall, {
		maxAttempts: policy.maxRetries ?? 3,
		baseDelay: policy.retryDelay ?? 1000,
		strategy: policy.exponentialBackoff ? "exponential" : "fixed",
		maxDelay: policy.maxDelay ?? 30000,
	});

	console.log("Result:", result);
};
