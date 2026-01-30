import { retry } from "../retry";

// Example 3: Retry with exponential backoff
export const example3_exponentialBackoff = async () => {
	let attempts = 0;

	const callService = async () => {
		attempts++;
		console.log(`Attempt ${attempts}`);
		if (attempts < 3) {
			throw new Error("Service error");
		}
		return "Success";
	};

	const result = await retry(callService, {
		maxAttempts: 3,
		baseDelay: 100,
		strategy: "exponential",
	});

	console.log("Result:", result);
	// Output: Attempts with exponential delays (100ms, 200ms)
};
