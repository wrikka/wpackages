/**
 * Format Error Component - Usage Examples
 */

import { formatError, formatErrors } from "./format-error.component";

// Example 1: Format single error
const error = {
	message: "Unexpected token",
	line: 10,
	column: 5,
};

const formatted = formatError(error);
console.log(formatted);
// Output: { message: "Unexpected token", line: 10, column: 5 }

// Example 2: Format multiple errors
const errors = [
	{ message: "Unexpected token", line: 10, column: 5 },
	{ message: "Missing semicolon", line: 15, column: 20 },
];

const formattedErrors = formatErrors(errors);
console.log(formattedErrors);
// Output: Array of formatted errors
