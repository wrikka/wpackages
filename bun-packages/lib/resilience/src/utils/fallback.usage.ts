/**
 * Usage examples for fallback utility function
 */

import type { ResilienceFunction } from "../types";
import { withFallback } from "./fallback";
import { createFailure, createSuccess } from "./result";

// Example 1: Basic fallback usage
export const example1_basicFallback = async () => {
	const fetchPrimaryData: ResilienceFunction<string> = async () => {
		// Simulate primary data fetch
		return createSuccess("Primary data");
	};

	const fallbackData = async () => "Fallback data";

	const wrapped = withFallback(fetchPrimaryData, fallbackData);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: { success: true, data: "Primary data", ... }
};

// Example 2: Fallback when primary fails
export const example2_fallbackOnFailure = async () => {
	const fetchPrimaryData: ResilienceFunction<string> = async () => {
		// Simulate primary data fetch failure
		return createFailure<string>(new Error("Primary service down"));
	};

	const fallbackData = async () => "Cached data";

	const wrapped = withFallback(fetchPrimaryData, fallbackData);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: { success: true, data: "Cached data", ... }
};

// Example 3: Fallback with error handling
export const example3_errorHandling = async () => {
	const unreliableService: ResilienceFunction<number> = async () => {
		if (Math.random() > 0.5) {
			return createSuccess(Math.random() * 100);
		}
		return createFailure<number>(new Error("Service error"));
	};

	const defaultValue = async () => 50;

	const wrapped = withFallback(unreliableService, defaultValue);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: Either actual data or default value
};

// Example 4: Chained fallbacks
export const example4_chainedFallbacks = async () => {
	const primary: ResilienceFunction<string> = async () => createFailure<string>(new Error("Primary failed"));

	const secondary = async () => "Secondary data";

	const primaryWithFallback = withFallback(primary, secondary);
	const result = await primaryWithFallback();

	console.log("Result:", result);
	// Output: { success: true, data: "Secondary data", ... }
};

// Example 5: Fallback with async operations
export const example5_asyncFallback = async () => {
	const fetchFromAPI: ResilienceFunction<{ id: number; name: string }> = async () => {
		// Simulate API call
		return createFailure(new Error("API timeout"));
	};

	const fetchFromCache = async () => ({
		id: 1,
		name: "Cached item",
	});

	const wrapped = withFallback(fetchFromAPI, fetchFromCache);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: { success: true, data: { id: 1, name: "Cached item" }, ... }
};

// Example 6: Fallback with arguments
export const example6_fallbackWithArgs = async () => {
	const fetchUser: ResilienceFunction<{ id: number; name: string }, [number]> = async (userId: number) => {
		if (userId > 0) {
			return createSuccess({ id: userId, name: "User" });
		}
		return createFailure(new Error("Invalid user ID"));
	};

	const defaultUser = async () => ({ id: 0, name: "Guest" });

	const wrapped = withFallback(fetchUser, defaultUser);
	const result = await wrapped(1);

	console.log("Result:", result);
	// Output: { success: true, data: { id: 1, name: "User" }, ... }
};

// Example 7: Real-world scenario - Database with cache fallback
export const example7_databaseWithCache = async () => {
	const queryDatabase: ResilienceFunction<string[]> = async () => {
		// Simulate database query
		const isAvailable = Math.random() > 0.3;
		if (isAvailable) {
			return createSuccess(["item1", "item2", "item3"]);
		}
		return createFailure<string[]>(new Error("Database connection failed"));
	};

	const getCachedData = async () => ["cached1", "cached2"];

	const wrapped = withFallback(queryDatabase, getCachedData);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: Either fresh data from DB or cached data
};

// Example 8: Fallback with retry-like behavior
export const example8_fallbackWithRetry = async () => {
	let attempts = 0;

	const unreliableOperation: ResilienceFunction<number> = async () => {
		attempts++;
		if (attempts < 2) {
			return createFailure<number>(new Error("Attempt failed"));
		}
		return createSuccess(42);
	};

	const fallbackValue = async () => 0;

	const wrapped = withFallback(unreliableOperation, fallbackValue);
	const result = await wrapped();

	console.log("Result:", result);
	// Output: { success: true, data: 0, ... } (uses fallback)
};
