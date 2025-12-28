/**
 * Usage examples for mock and spy utilities
 */

import { createMock, spyOn } from "./mock";

// Example 1: Basic mock function
export const example1_basicMock = () => {
	const mockFn = createMock(() => "hello");
	const result = mockFn();
	console.log("Mock result:", result); // "hello"
	console.log("Call count:", mockFn.callCount); // 1
};

// Example 2: Mock with return value
export const example2_mockReturnValue = () => {
	const mockFn = createMock(() => 0);
	mockFn.mockReturnValue(42);
	console.log("Result:", mockFn()); // 42
};

// Example 3: Mock with different return values
export const example3_mockReturnValueOnce = () => {
	const mockFn = createMock(() => 0);
	mockFn.mockReturnValueOnce(1);
	mockFn.mockReturnValueOnce(2);
	mockFn.mockReturnValueOnce(3);
	console.log("First call:", mockFn()); // 1
	console.log("Second call:", mockFn()); // 2
	console.log("Third call:", mockFn()); // 3
	console.log("Fourth call:", mockFn()); // 0 (default)
};

// Example 4: Track mock calls
export const example4_trackCalls = () => {
	const mockFn = createMock((...args: unknown[]) => {
		const x = args[0] as number;
		return x * 2;
	});
	mockFn(5);
	mockFn(10);
	mockFn(15);
	console.log("Call count:", mockFn.callCount); // 3
	console.log("All calls:", mockFn.calls); // [[5], [10], [15]]
	console.log("Last call:", mockFn.lastCall); // [15]
	console.log("Last result:", mockFn.lastResult); // 30
};

// Example 5: Mock implementation
export const example5_mockImplementation = () => {
	const mockFn = createMock((...args: unknown[]) => {
		const x = args[0] as number;
		return x * 3;
	});
	mockFn.mockImplementation((...args: unknown[]) => {
		const x = args[0] as number;
		return x * 3;
	});
	console.log("Result:", mockFn(5)); // 15
};

// Example 6: Spy on object method
export const example6_spyOnMethod = () => {
	const calculator = {
		add: (a: number, b: number) => a + b,
		multiply: (a: number, b: number) => a * b,
	};

	const addSpy = spyOn(calculator, "add");
	calculator.add(2, 3);
	calculator.add(5, 7);

	console.log("Add was called:", addSpy.callCount, "times"); // 2
	console.log("Add calls:", addSpy.calls); // [[2, 3], [5, 7]]
};

// Example 7: Mock async function
export const example7_mockAsync = () => {
	const mockFn = createMock(async () => "default");
	mockFn.mockResolvedValue("mocked value");
	console.log("Mock is set up for async");
};

// Example 8: Reset mock
export const example8_resetMock = () => {
	const mockFn = createMock(() => 42);
	mockFn();
	mockFn();
	console.log("Before reset:", mockFn.callCount); // 2
	mockFn.reset();
	console.log("After reset:", mockFn.callCount); // 0
};

// Example 9: Real-world scenario - testing API calls
export const example9_testingApiCalls = () => {
	interface ApiClient {
		get: (url: string) => Promise<unknown>;
		post: (url: string, data: unknown) => Promise<unknown>;
	}

	const apiClient: ApiClient = {
		get: async (_url) => ({ data: "real data" }),
		post: async (_url, _data) => ({ success: true }),
	};

	const getSpy = spyOn(apiClient as unknown as Record<string, unknown>, "get");
	const postSpy = spyOn(apiClient as unknown as Record<string, unknown>, "post");

	(getSpy as any).mockResolvedValue({ data: "mocked" });
	(postSpy as any).mockResolvedValue({ success: false });

	console.log("API client is now mocked for testing");
};

// Example 10: Verify mock was called with specific arguments
export const example10_verifyArguments = () => {
	const mockFn = createMock((...args: unknown[]) => {
		const name = args[0] as string;
		const age = args[1] as number;
		return `${name} is ${age}`;
	});

	mockFn("John", 30);
	mockFn("Jane", 25);

	console.log("First call arguments:", mockFn.calls[0]); // ["John", 30]
	console.log("Second call arguments:", mockFn.calls[1]); // ["Jane", 25]
};
