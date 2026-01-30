import { retry } from "../retry";

// Example 6: Retry with shouldRetry predicate
export const example6_shouldRetryPredicate = async () => {
	let attempts = 0;

	const fetchAPI = async () => {
		attempts++;
		if (attempts < 2) {
			throw new Error("Temporary error");
		}
		if (attempts === 2) {
			throw new Error("Permanent error");
		}
		return "Success";
	};

	const result = await retry(fetchAPI, {
		maxAttempts: 5,
		shouldRetry: (error) => {
			// Only retry on temporary errors
			return error.message.includes("Temporary");
		},
	});

	console.log("Result:", result);
	// Output: { success: false, error: Error("Permanent error"), attempts: 2, ... }
};
