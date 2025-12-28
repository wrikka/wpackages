/**
 * Result utility usage examples
 */

import * as Result from "./result.util";

// Example 1: Basic usage
const divide = (a: number, b: number): Result.Result<number, string> =>
	b === 0 ? Result.err<number, string>("Division by zero") : Result.ok(a / b);

const result1 = divide(10, 2);
console.log("Result 1:", Result.unwrap(result1)); // 5

const result2 = divide(10, 0);
console.log("Result 2:", Result.unwrapOr(result2, 0)); // 0

// Example 2: Chaining operations
const calculate = (x: number): Result.Result<number, string> =>
	Result.flatMap(divide(x, 2), (half) =>
		half > 5 ? Result.ok(half * 2) : Result.err<number, string>("Too small"),
	);

console.log("Calculate 20:", calculate(20)); // Ok(20)
console.log("Calculate 8:", calculate(8)); // Err("Too small")

// Example 3: Error mapping
const parseNumber = (str: string): Result.Result<number, string> => {
	const num = Number.parseFloat(str);
	return Number.isNaN(num)
		? Result.err<number, string>("Invalid number")
		: Result.ok(num);
};

const result3 = Result.mapErr(parseNumber("abc"), (err) => `Error: ${err}`);
console.log("Parse result:", result3); // Err("Error: Invalid number")
