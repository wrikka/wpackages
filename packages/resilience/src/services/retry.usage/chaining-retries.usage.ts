import { retry } from "../retry";

// Example 11: Chaining retries with other operations
export const example11_chainingRetries = async () => {
	let fetchAttempts = 0;
	let processAttempts = 0;

	const fetchData = async () => {
		fetchAttempts++;
		if (fetchAttempts < 2) {
			throw new Error("Fetch failed");
		}
		return [1, 2, 3];
	};

	const processData = async (data: number[]) => {
		processAttempts++;
		if (processAttempts < 2) {
			throw new Error("Process failed");
		}
		return data.reduce((a, b) => a + b, 0);
	};

	const fetchResult = await retry(fetchData, { maxAttempts: 3 });

	if (fetchResult.success && fetchResult.value !== undefined) {
		const data = fetchResult.value;
		const processResult = await retry(
			() => processData(data),
			{ maxAttempts: 3 },
		);

		if (processResult.success) {
			console.log("Final result:", processResult.value);
		}
	}
};
