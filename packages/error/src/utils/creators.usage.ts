/**
 * Error Creators Usage Examples
 */

import { err, ok } from "program";
import * as E from "../services/creators";

// ============================================
// Example 1: Validation Error
// ============================================

function validateEmail(email: string): any {
	if (!email.includes("@")) {
		return err(
			E.validationError("Invalid email format", {
				field: "email",
				value: email,
			}),
		);
	}
	return ok(email);
}

// Usage
const result1 = validateEmail("not-an-email");
if (!result1.ok) {
	console.log("Error:", result1.error.message);
	console.log("Field:", result1.error.field);
}

// ============================================
// Example 2: Not Found Error
// ============================================

async function findUser(id: number): Promise<any> {
	const users = [
		{ id: 1, name: "John" },
		{ id: 2, name: "Jane" },
	];

	const user = users.find(u => u.id === id);
	if (!user) {
		return err(E.notFoundError("User", id));
	}

	return ok(user);
}

// Usage
const result2 = await findUser(999);
if (!result2.ok) {
	console.log("Error:", result2.error.message); // "User with id "999" not found"
	console.log("Resource:", result2.error.resource);
}

// ============================================
// Example 3: HTTP Error with Try
// ============================================

async function handleHttpError(url: string): Promise<any> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return ok(await response.json());
	} catch (e) {
		return err(e as Error);
	}
}

// Usage
const httpResult = await handleHttpError("https://api.example.com/data");
if (!httpResult.ok) {
	console.log("HTTP Error:", httpResult.error.message);
}

// ============================================
// Example 4: Database Error
// ============================================

async function handleDatabaseQuery(sql: string): Promise<any> {
	try {
		// Simulate database query
		if (sql.includes("DROP")) {
			throw new Error("Dangerous query blocked");
		}
		return ok([]);
	} catch (e) {
		return err(e as Error);
	}
}

// Usage
const dbResult = await handleDatabaseQuery("SELECT * FROM users");
if (dbResult.ok) {
	console.log("Query result:", dbResult.value);
}

// ============================================
// Example 5: Chaining with Result
// ============================================

function processUser(id: number): Promise<any> {
	return findUser(id).then((userResult) => {
		if (!userResult.ok) {
			return userResult;
		}

		const user = userResult.value;
		return validateEmail(`${user.name}@example.com`);
	});
}

// Usage
const result5 = await processUser(1);
if (result5.ok) {
	console.log("Email:", result5.value);
} else {
	console.log("Error:", result5.error.name, result5.error.message);
}

// ============================================
// Example 6: Error from unknown
// ============================================

function handleUnknownError(error: unknown): any {
	return E.fromUnknown(error);
}

try {
	throw "Something went wrong";
} catch (error) {
	const appError = handleUnknownError(error);
	console.log("Converted error:", appError);
}

// ============================================
// Example 7: HTTP Status Errors
// ============================================

function handleHttpStatus(status: number): any {
	if (status === 401) {
		return E.unauthorizedError("Authentication required");
	}

	if (status === 403) {
		return E.forbiddenError("Access denied");
	}

	return E.httpError(`HTTP Error ${status}`, status);
}

// Usage
const httpError = handleHttpStatus(403);
console.log("Error:", httpError.name, httpError.message);
