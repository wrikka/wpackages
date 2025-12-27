import type { ValidationError } from "../types";
import { Result } from "./result";
import type { Err, Result as ResultType } from "./result";

/**
 * Validation utilities - Pure functions
 */

/**
 * Validate required fields
 */
export const validateRequired = <T extends Record<string, unknown>>(
	data: T,
	fields: readonly (keyof T)[],
): ResultType<T, ValidationError> => {
	const missing = fields.filter((field) => {
		const value = data[field];
		return value === undefined || value === null || value === "";
	});

	if (missing.length > 0) {
		return Result.err({
			errors: missing.map((field) => `${String(field)} is required`),
			message: `Missing required fields: ${missing.join(", ")}`,
			type: "validation",
		});
	}

	return Result.ok(data);
};

/**
 * Validate URL format
 */
export const validateUrl = (
	url: string,
	field = "url",
): ResultType<string, ValidationError> => {
	try {
		new URL(url);
		return Result.ok(url);
	} catch {
		return Result.err({
			field,
			message: `Invalid URL format: ${url}`,
			type: "validation",
		});
	}
};

/**
 * Validate email format
 */
export const validateEmail = (
	email: string,
	field = "email",
): ResultType<string, ValidationError> => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		return Result.err({
			field,
			message: `Invalid email format: ${email}`,
			type: "validation",
		});
	}

	return Result.ok(email);
};

/**
 * Validate string length
 */
export const validateLength = (
	value: string,
	min: number,
	max: number,
	field = "value",
): ResultType<string, ValidationError> => {
	if (value.length < min) {
		return Result.err({
			field,
			message: `${field} must be at least ${min} characters`,
			type: "validation",
		});
	}

	if (value.length > max) {
		return Result.err({
			field,
			message: `${field} must be at most ${max} characters`,
			type: "validation",
		});
	}

	return Result.ok(value);
};

/**
 * Validate number range
 */
export const validateRange = (
	value: number,
	min: number,
	max: number,
	field = "value",
): ResultType<number, ValidationError> => {
	if (value < min || value > max) {
		return Result.err({
			field,
			message: `${field} must be between ${min} and ${max}`,
			type: "validation",
		});
	}

	return Result.ok(value);
};

/**
 * Validate enum value
 */
export const validateEnum = <T extends string>(
	value: string,
	allowed: readonly T[],
	field = "value",
): ResultType<T, ValidationError> => {
	if (!allowed.includes(value as T)) {
		return Result.err({
			field,
			message: `${field} must be one of: ${allowed.join(", ")}`,
			type: "validation",
		});
	}

	return Result.ok(value as T);
};

/**
 * Combine multiple validation results
 */
export const validateAll = <T>(
	...validations: readonly ResultType<T, ValidationError>[]
): ResultType<T, ValidationError> => {
	const errors: string[] = [];

	for (const validation of validations) {
		if (Result.isErr(validation)) {
			errors.push((validation as Err<ValidationError>).error.message);
		}
	}

	if (errors.length > 0) {
		return Result.err({
			errors,
			message: "Validation failed",
			type: "validation",
		});
	}

	// Return the first validation (or throw if empty)
	if (validations.length === 0) {
		return Result.err({
			message: "No validations provided",
			type: "validation",
		});
	}

	const first = validations[0];
	if (!first) {
		return Result.err({
			message: "No validations provided",
			type: "validation",
		});
	}

	return first;
};
