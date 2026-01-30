import { retry } from "../retry";

// Example 12: Retry with timeout consideration
export const example12_retryWithTimeout = async () => {
	let attempts = 0;

	const slowOperation = async () => {
		attempts++;
		// Simulate slow operation
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (attempts < 2) {
			throw new Error("Slow operation failed");
		}
		return "Completed";
	};

	const result = await retry(slowOperation, {
		maxAttempts: 3,
		baseDelay: 50,
		maxDelay: 500,
	});

	console.log("Result:", result);
	console.log("Total time:", result.totalDuration, "ms");
};
