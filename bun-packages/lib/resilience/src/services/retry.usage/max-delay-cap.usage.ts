import { retry } from "../retry";

// Example 8: Retry with max delay cap
export const example8_maxDelayCap = async () => {
	let attempts = 0;

	const slowService = async () => {
		attempts++;
		if (attempts < 4) {
			throw new Error("Service busy");
		}
		return "Response";
	};

	const result = await retry(slowService, {
		maxAttempts: 4,
		baseDelay: 1000,
		maxDelay: 200, // Cap delays at 200ms
		strategy: "exponential",
	});

	console.log("Result:", result);
	// Output: Delays capped at 200ms
};
