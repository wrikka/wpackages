/**
 * Mock and spy utilities for testing
 */

/**
 * Mock function
 */
export interface MockFn<T extends (...args: unknown[]) => unknown> {
	(...args: Parameters<T>): ReturnType<T>;
	calls: Parameters<T>[];
	results: ReturnType<T>[];
	lastCall?: Parameters<T>;
	lastResult?: ReturnType<T>;
	callCount: number;
	reset: () => void;
	mockReturnValue: (value: ReturnType<T>) => MockFn<T>;
	mockReturnValueOnce: (value: ReturnType<T>) => MockFn<T>;
	mockImplementation: (fn: T) => MockFn<T>;
	mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockFn<T>;
	mockRejectedValue: (error: Error) => MockFn<T>;
}

/**
 * Create mock function
 */
export const createMock = <T extends (...args: unknown[]) => unknown>(
	implementation?: T,
): MockFn<T> => {
	let returnValue: ReturnType<T> | undefined;
	let returnValues: ReturnType<T>[] = [];
	let impl = implementation;
	const calls: Parameters<T>[] = [];
	const results: ReturnType<T>[] = [];

	const mock = ((...args: Parameters<T>) => {
		calls.push(args);

		if (returnValues.length > 0) {
			const value = returnValues.shift();
			results.push(value as ReturnType<T>);
			return value;
		}

		if (returnValue !== undefined) {
			results.push(returnValue);
			return returnValue;
		}

		if (impl) {
			const result = impl(...args);
			results.push(result as ReturnType<T>);
			return result;
		}

		results.push(undefined as unknown as ReturnType<T>);
		return undefined;
	}) as MockFn<T>;

	mock.calls = calls;
	mock.results = results;
	mock.callCount = 0;

	Object.defineProperty(mock, "callCount", {
		get: () => calls.length,
	});

	Object.defineProperty(mock, "lastCall", {
		get: () => calls[calls.length - 1],
	});

	Object.defineProperty(mock, "lastResult", {
		get: () => results[results.length - 1],
	});

	mock.reset = () => {
		calls.length = 0;
		results.length = 0;
		returnValues.length = 0;
		returnValue = undefined;
		impl = implementation;
	};

	mock.mockReturnValue = (value: ReturnType<T>) => {
		returnValue = value;
		returnValues.length = 0;
		return mock;
	};

	mock.mockReturnValueOnce = (value: ReturnType<T>) => {
		returnValues.push(value);
		return mock;
	};

	mock.mockImplementation = (fn: T) => {
		impl = fn;
		return mock;
	};

	mock.mockResolvedValue = (value: Awaited<ReturnType<T>>) => {
		returnValue = Promise.resolve(value) as ReturnType<T>;
		return mock;
	};

	mock.mockRejectedValue = (error: Error) => {
		returnValue = Promise.reject(error) as ReturnType<T>;
		return mock;
	};

	return mock;
};

/**
 * Spy on object method
 */
export const spyOn = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	method: K,
): MockFn<T[K] extends (...args: unknown[]) => unknown ? T[K] : never> => {
	const original = obj[method];
	const mock = createMock(original as any);
	obj[method] = mock as any;
	return mock;
};

/**
 * Restore original method
 */
export const restore = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	method: K,
	original: unknown,
): void => {
	obj[method] = original as any;
};
