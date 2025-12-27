/**
 * Usage examples for no-if-else rule
 */

import { err, ok } from "functional";

// ❌ Bad - Long if-else chain
// function getStatusBad(code: number): string {
// 	if (code === 200) {
// 		return "OK";
// 	} else if (code === 404) {
// 		return "Not Found";
// 	} else if (code === 500) {
// 		return "Server Error";
// 	} else {
// 		return "Unknown";
// 	}
// }

// ✅ Good - Lookup table
const STATUS_MAP: Record<number, string> = {
	200: "OK",
	404: "Not Found",
	500: "Server Error",
};

const getStatusGood = (code: number): string => STATUS_MAP[code] ?? "Unknown";

// ❌ Bad - Nested if-else
// function processResultBad(result: {
// 	success?: boolean;
// 	data?: unknown;
// 	error?: unknown;
// }) {
// 	if (result.success) {
// 		if (result.data) {
// 			return result.data;
// 		} else {
// 			return null;
// 		}
// 	} else {
// 		if (result.error) {
// 			throw result.error;
// 		} else {
// 			throw new Error("Unknown error");
// 		}
// 	}
// }

// ✅ Good - Pattern matching with Result
type ApiResult<T> =
	| { success: true; data: T }
	| { success: false; error: Error };

function processResultGood<T>(result: ApiResult<T>) {
	return result.success ? ok(result.data) : err(result.error);
}

// ❌ Bad - Multiple conditions
// function categorizeAgeBad(age: number): string {
// 	if (age < 13) {
// 		return "child";
// 	} else if (age < 18) {
// 		return "teenager";
// 	} else if (age < 65) {
// 		return "adult";
// 	} else {
// 		return "senior";
// 	}
// }

// ✅ Good - Functional approach with guards
const categorizeAgeGood = (age: number): string => {
	if (age < 13) return "child";
	if (age < 18) return "teenager";
	if (age < 65) return "adult";
	return "senior";
};

// Or even better - Lookup with ranges
const AGE_CATEGORIES = [
	{ max: 13, label: "child" },
	{ max: 18, label: "teenager" },
	{ max: 65, label: "adult" },
	{ max: Number.POSITIVE_INFINITY, label: "senior" },
] as const;

const categorizeAgeBest = (age: number): string =>
	AGE_CATEGORIES.find((cat) => age < cat.max)?.label ?? "unknown";

// ✅ Good - Simple ternary for binary choice
const isEven = (n: number) => (n % 2 === 0 ? "even" : "odd");

// ✅ Good - Match pattern from Result/Option
import type { Result } from "../utils/result.util";

function handleResult<T>(result: Result<T, Error>) {
	return result.match({
		ok: (value: T) => console.log("Success:", value),
		err: (error: Error) => console.error("Error:", error.message),
	});
}

// Export for examples
export { getStatusGood, processResultGood, categorizeAgeGood, categorizeAgeBest, isEven, handleResult };

