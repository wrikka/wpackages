import { createSelector } from "./conditionalSelector";

// --------------------------
// Example 1: Basic number classification
// --------------------------
console.log("--- Example 1: Basic number classification ---");

const classifyNumber = createSelector([
	{ condition: (n: number) => n > 0, result: "Positive" },
	{ condition: (n: number) => n < 0, result: "Negative" },
], "Zero");

console.log("Input: 10, Output:", classifyNumber(10)); // Output: Positive
console.log("Input: -5, Output:", classifyNumber(-5)); // Output: Negative
console.log("Input: 0, Output:", classifyNumber(0)); // Output: Zero

// --------------------------
// Example 2: Role-based access control with dynamic results
// --------------------------
console.log("\n--- Example 2: Role-based access control ---");

type User = { name: string; role: "admin" | "editor" | "viewer" };

const getWelcomeMessage = createSelector([
	{
		condition: (user: User) => user.role === "admin",
		result: (user: User) => `Welcome, Administrator ${user.name}!`,
	},
	{
		condition: (user: User) => user.role === "editor",
		result: (user: User) => `Hello, ${user.name}. You can edit content.`,
	},
], (user: User) => `Hi, ${user.name}. You have view-only access.`);

const admin: User = { name: "Alice", role: "admin" };
const editor: User = { name: "Bob", role: "editor" };
const viewer: User = { name: "Charlie", role: "viewer" };

console.log(getWelcomeMessage(admin)); // Output: Welcome, Administrator Alice!
console.log(getWelcomeMessage(editor)); // Output: Hello, Bob. You can edit content.
console.log(getWelcomeMessage(viewer)); // Output: Hi, Charlie. You have view-only access.

// --------------------------
// Example 3: HTTP status code handler
// --------------------------
console.log("\n--- Example 3: HTTP status code handler ---");

const handleResponse = createSelector([
	{ condition: (code: number) => code >= 200 && code < 300, result: "Success" },
	{ condition: (code: number) => code >= 400 && code < 500, result: "Client Error" },
	{ condition: (code: number) => code >= 500, result: "Server Error" },
], "Unknown Status Code");

console.log("Status 200:", handleResponse(200)); // Output: Success
console.log("Status 404:", handleResponse(404)); // Output: Client Error
console.log("Status 503:", handleResponse(503)); // Output: Server Error
console.log("Status 301:", handleResponse(301)); // Output: Unknown Status Code
