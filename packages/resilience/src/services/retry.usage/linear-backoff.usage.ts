import { retry } from "../retry";

// Example 4: Retry with linear backoff
export const example4_linearBackoff = async () => {
	let attempts = 0;

	const operation = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("Fail");
		}
		return "Success";
	};

	const result = await retry(operation, {
		maxAttempts: 3,
		baseDelay: 50,
		strategy: "linear",
	});

	console.log("Result:", result);
	// Output: Attempts with linear delays (50ms, 100ms)
};
