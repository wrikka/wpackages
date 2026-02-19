import { retry } from "../retry";

// Example 2: Retry with custom max attempts
export const example2_customMaxAttempts = async () => {
	let attempts = 0;

	const fetchData = async () => {
		attempts++;
		if (attempts < 5) {
			throw new Error("Connection timeout");
		}
		return "Data";
	};

	const result = await retry(fetchData, { maxAttempts: 5 });
	console.log("Result:", result);
	// Output: { success: true, value: "Data", attempts: 5, ... }
};
