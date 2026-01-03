/**
 * Usage examples for result utility functions
 */

import { chain, createFailure, createSuccess, getOrElse, getOrThrow, isFailure, isSuccess, map } from "./result";

// Example 1: Basic success and failure creation
export const example1_basicCreation = () => {
	const successResult = createSuccess(42);
	console.log("Success:", successResult);
	// Output: { success: true, data: 42, metadata: { attempts: 1, duration: 0 } }

	const failureResult = createFailure<number>(new Error("Operation failed"), 3, 1500);
	console.log("Failure:", failureResult);
	// Output: { success: false, error: Error(...), metadata: { attempts: 3, duration: 1500 } }
};

// Example 2: Mapping successful results
export const example2_mapping = () => {
	const result = createSuccess(5);
	const doubled = map((x: number) => x * 2)(result);

	if (isSuccess(doubled)) {
		console.log("Doubled value:", doubled.data); // 10
	}
};

// Example 3: Chaining operations
export const example3_chaining = async () => {
	const result = createSuccess(10);

	const chained = await chain((x: number) => Promise.resolve(createSuccess(x * 2)))(result);

	if (isSuccess(chained)) {
		console.log("Chained result:", chained.data); // 20
	}
};

// Example 4: Type guards
export const example4_typeGuards = () => {
	const result = createSuccess("Hello");

	if (isSuccess(result)) {
		console.log("Success:", result.data);
	} else if (isFailure(result)) {
		console.log("Failure:", result.error.message);
	}
};

// Example 5: Getting values with defaults
export const example5_getOrElse = () => {
	const successResult = createSuccess(42);
	const value1 = getOrElse(successResult, 0);
	console.log("Success value:", value1); // 42

	const failureResult = createFailure<number>(new Error("Failed"));
	const value2 = getOrElse(failureResult, 0);
	console.log("Default value:", value2); // 0
};

// Example 6: Getting values or throwing
export const example6_getOrThrow = () => {
	const successResult = createSuccess(42);
	const value = getOrThrow(successResult);
	console.log("Value:", value); // 42

	const failureResult = createFailure<number>(new Error("Operation failed"));
	try {
		getOrThrow(failureResult);
	} catch (error) {
		console.log("Caught error:", (error as Error).message); // "Operation failed"
	}
};

// Example 7: Composing multiple operations
export const example7_composition = async () => {
	const fetchData = async (): Promise<number> => {
		return new Promise((resolve) => {
			setTimeout(() => resolve(100), 100);
		});
	};

	const result = createSuccess(10);

	const composed = await chain(async (x: number) => {
		const data = await fetchData();
		return createSuccess(x + data);
	})(result);

	if (isSuccess(composed)) {
		console.log("Composed result:", composed.data); // 110
	}
};

// Example 8: Error handling in chain
export const example8_errorHandling = async () => {
	const result = createSuccess(5);

	const withError = await chain((x: number) => {
		if (x < 10) {
			return Promise.resolve(
				createFailure<number>(new Error("Value too small")),
			);
		}
		return Promise.resolve(createSuccess(x * 2));
	})(result);

	if (isFailure(withError)) {
		console.log("Error:", withError.error.message); // "Value too small"
	}
};
