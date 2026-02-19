/**
 * Usage examples for Result utility
 */

import * as Result from "./result.util";

// Example: Safe division
const divide = (a: number, b: number): Result.Result<number, string> => {
	if (b === 0) {
		return Result.err("Division by zero");
	}
	return Result.ok(a / b);
};

// Usage
const result1 = divide(10, 2);
if (Result.isOk(result1)) {
	console.log("Result:", result1.value); // 5
}

const result2 = divide(10, 0);
if (Result.isErr(result2)) {
	console.log("Error:", result2.error); // "Division by zero"
}

// Using map
const doubled = Result.map(divide(10, 2), (x) => x * 2);
console.log(Result.unwrap(doubled)); // 10

// Using unwrapOr
const safe = Result.unwrapOr(divide(10, 0), 0);
console.log(safe); // 0
