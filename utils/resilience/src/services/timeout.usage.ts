/**
 * Usage examples for timeout service
 */

import { delay, race, raceAll, timeout, withDeadline, withTimeout } from "./timeout";

// Example 1: Basic timeout with withTimeout
export const example1_basicTimeout = async () => {
	const slowAPI = async () => {
		await delay(5000);
		return "data";
	};

	try {
		const result = await withTimeout(slowAPI, { duration: 2000 });
		console.log("Result:", result);
	} catch (error) {
		console.error("Operation timed out:", error);
	}
};

// Example 2: Timeout with onTimeout callback
export const example2_onTimeoutCallback = async () => {
	const operation = async () => {
		await delay(3000);
		return "success";
	};

	try {
		const result = await withTimeout(operation, {
			duration: 1000,
			onTimeout: () => {
				console.log("Operation exceeded timeout limit");
			},
		});
		console.log("Result:", result);
	} catch (error) {
		console.error("Timeout error:", error);
	}
};

// Example 3: Timeout with result tracking
export const example3_timeoutWithTracking = async () => {
	const fetchData = async () => {
		await delay(2000);
		return { id: 1, name: "Item" };
	};

	const result = await timeout(fetchData, { duration: 5000 });

	if (result.success) {
		console.log("Success:", result.value);
		console.log("Duration:", result.duration, "ms");
	} else {
		console.error("Failed:", result.error.message);
		console.log("Duration:", result.duration, "ms");
	}
};

// Example 4: Timeout with cleanup
export const example4_timeoutWithCleanup = async () => {
	let resource: any = null;

	const operation = async () => {
		resource = { allocated: true };
		await delay(3000);
		return "done";
	};

	const result = await timeout(operation, {
		duration: 1000,
		cleanup: async () => {
			if (resource) {
				console.log("Cleaning up resource");
				resource = null;
			}
		},
	});

	console.log("Result:", result);
};

// Example 5: Race multiple promises with timeout
export const example5_raceWithTimeout = async () => {
	const promises = [
		delay(500).then(() => "fast"),
		delay(2000).then(() => "slow"),
		delay(1000).then(() => "medium"),
	];

	try {
		const result = await race(promises, 1500);
		console.log("Winner:", result);
	} catch {
		console.error("All promises timed out");
	}
};

// Example 6: Race all promises with timeout
export const example6_raceAllWithTimeout = async () => {
	const promises = [
		delay(100).then(() => "first"),
		delay(200).then(() => "second"),
		delay(150).then(() => "third"),
	];

	try {
		const results = await raceAll(promises, 500);
		console.log("All results:", results);
	} catch {
		console.error("Some promises timed out");
	}
};

// Example 7: Deadline-based timeout
export const example7_deadlineTimeout = async () => {
	const deadline = new Date(Date.now() + 3000);

	const operation = async () => {
		await delay(2000);
		return "completed";
	};

	try {
		const result = await withDeadline(operation, deadline);
		console.log("Result:", result);
	} catch (error) {
		console.error("Deadline exceeded:", error);
	}
};

// Example 8: Real-world scenario - API call with timeout
export const example8_apiCallWithTimeout = async () => {
	const fetchUserData = async (userId: number) => {
		// Simulate API call
		await delay(2000);
		return { id: userId, name: "John Doe", email: "john@example.com" };
	};

	const result = await timeout(() => fetchUserData(123), {
		duration: 5000,
		onTimeout: () => {
			console.warn("API call took too long");
		},
	});

	if (result.success) {
		console.log("User data:", result.value);
	} else {
		console.error("Failed to fetch user data:", result.error.message);
	}
};

// Example 9: Timeout with AbortSignal
export const example9_abortSignal = async () => {
	const controller = new AbortController();

	const operation = async () => {
		await delay(5000);
		return "done";
	};

	// Abort after 2 seconds
	setTimeout(() => controller.abort(), 2000);

	try {
		const result = await withTimeout(operation, {
			duration: 10000,
			signal: controller.signal,
		});
		console.log("Result:", result);
	} catch (error) {
		console.error("Operation aborted:", error);
	}
};

// Example 10: Multiple concurrent operations with timeout
export const example10_concurrentWithTimeout = async () => {
	const operations = [
		async () => {
			await delay(1000);
			return "op1";
		},
		async () => {
			await delay(1500);
			return "op2";
		},
		async () => {
			await delay(2000);
			return "op3";
		},
	];

	const results = await Promise.allSettled(
		operations.map((op) => timeout(op, { duration: 1200 })),
	);

	results.forEach((result, index) => {
		if (result.status === "fulfilled") {
			if (result.value.success) {
				console.log(`Operation ${index + 1}: ${result.value.value}`);
			} else {
				console.error(`Operation ${index + 1}: Timeout`);
			}
		} else {
			console.error(`Operation ${index + 1}: Error`);
		}
	});
};

// Example 11: Retry with timeout
export const example11_retryWithTimeout = async () => {
	let attempts = 0;

	const unreliableOperation = async () => {
		attempts++;
		console.log(`Attempt ${attempts}`);
		await delay(1000);

		if (attempts < 3) {
			throw new Error("Operation failed");
		}
		return "success";
	};

	for (let i = 0; i < 3; i++) {
		const result = await timeout(unreliableOperation, { duration: 2000 });

		if (result.success) {
			console.log("Success:", result.value);
			break;
		} else {
			console.error("Attempt failed:", result.error.message);
		}
	}
};

// Example 12: Timeout with promise chain
export const example12_promiseChainTimeout = async () => {
	const fetchData = async () => {
		await delay(1000);
		return { data: [1, 2, 3] };
	};

	const processData = async (data: any) => {
		await delay(1000);
		return data.data.reduce((a: number, b: number) => a + b, 0);
	};

	try {
		const data = await withTimeout(fetchData, { duration: 2000 });
		const result = await withTimeout(() => processData(data), { duration: 2000 });
		console.log("Final result:", result);
	} catch (error) {
		console.error("Operation timed out:", error);
	}
};
