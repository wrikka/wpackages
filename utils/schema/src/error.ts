import type { ParseError } from "./types/schema";
import type { Issue } from "./types";

export class ValidationError extends Error {
	public readonly issues: Issue[];

	constructor(issues: Issue[]) {
		super("Validation failed");
		this.name = "ValidationError";
		this.issues = issues;
	}
}

/**
 * A custom error class that wraps a ParseError for easier error handling.
 */
export class SchemaError extends Error {
	public readonly error: ParseError;

	constructor(error: ParseError) {
		super(error.message);
		this.name = "SchemaError";
		this.error = error;
	}
}
