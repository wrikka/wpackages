/**
 * Error Creators Usage Examples
 */

import { err, ok, isFailure, isSuccess, type Result } from '@wts/functional';
import type { AnyError } from '../error';
import * as E from './creators';

// ============================================
// Example 1: Validation Error
// ============================================

function validateEmail(email: string): Result<AnyError, string> {
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
if (isFailure(result1)) {
	console.log("Error:", result1.error.message);
	console.log("Field:", result1.error.field);
}

// ============================================
// Example 2: Not Found Error
// ============================================

async function findUser(id: number): Promise<Result<AnyError, { id: number; name: string }>> {
	const users = [
		{ id: 1, name: "John" },
		{ id: 2, name: "Jane" },
	];

	const user = users.find(u => u.id === id);
	if (!user) {
		return err(E.notFoundError('User', { id }));
	}

	return ok(user);
}

// Usage
const result2 = await findUser(999);
if (isFailure(result2)) {
	console.log("Error:", result2.error.message); // "User with id "999" not found"
	console.log("Resource:", result2.error.resource);
}

// ============================================
// Example 3: HTTP Error with Try
// ============================================

async function handleHttpError(url: string): Promise<Result<AnyError, unknown>> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return ok(await response.json());
	} catch (e) {
		return err(E.fromUnknown(e));
	}
}

// Usage
const httpResult = await handleHttpError("https://api.example.com/data");
if (isFailure(httpResult)) {
	console.log("HTTP Error:", httpResult.error.message);
}

// ============================================
// Example 4: Database Error
// ============================================

async function handleDatabaseQuery(sql: string): Promise<Result<AnyError, unknown[]>> {
	try {
		// Simulate database query
		if (sql.includes("DROP")) {
			throw new Error("Dangerous query blocked");
		}
		return ok([]);
	} catch (e) {
		return err(E.fromUnknown(e));
	}
}

// Usage
const dbResult = await handleDatabaseQuery("SELECT * FROM users");
if (isSuccess(dbResult)) {
	console.log("Query result:", dbResult.value);
}

// ============================================
// Example 5: Chaining with Result
// ============================================

function processUser(id: number): Promise<Result<AnyError, string>> {
	return findUser(id).then((userResult) => {
		if (isFailure(userResult)) {
			return userResult;
		}

		const user = userResult.value;
		return validateEmail(`${user.name}@example.com`);
	});
}

// Usage
const result5 = await processUser(1);
if (isSuccess(result5)) {
	console.log("Email:", result5.value);
} else {
	console.log("Error:", result5.error.name, result5.error.message);
}

// ============================================
// Example 6: Error from unknown
// ============================================

function handleUnknownError(error: unknown) {
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

function handleHttpStatus(status: number) {
	if (status === 401) {
		return E.unauthorizedError("Authentication required");
	}

	if (status === 403) {
		return E.forbiddenError("Access denied");
	}

	return E.httpError(status, `HTTP Error ${status}`);
}

// Usage
const httpError = handleHttpStatus(403);
console.log("Error:", httpError.name, httpError.message);
