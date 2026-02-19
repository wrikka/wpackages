/**
 * Error handling layer
 */

import type { SchemaIssue } from '../types';

/**
 * Base error class for schema validation
 */
export class SchemaError extends Error {
	constructor(
		message: string,
		public readonly issues: SchemaIssue[] = [],
	) {
		super(message);
		this.name = 'SchemaError';
	}
}

/**
 * Parse error with detailed issue information
 */
export class ParseError extends SchemaError {
	constructor(issues: SchemaIssue[]) {
		const message = issues
			.map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
			.join('\n');
		super(message, issues);
		this.name = 'ParseError';
	}
}

/**
 * Type error for type mismatches
 */
export class TypeError extends SchemaError {
	constructor(expected: string, received: string, path: string[] = []) {
		const message = `Expected ${expected}, received ${received}`;
		super(message, [{ path, message, code: 'type_mismatch' }]);
		this.name = 'TypeError';
	}
}

/**
 * Validation error for failed validations
 */
export class ValidationError extends SchemaError {
	constructor(message: string, code: string, path: string[] = [], value?: unknown) {
		super(message, [{ path, message, code, value }]);
		this.name = 'ValidationError';
	}
}

/**
 * Create error from issues
 */
export function createError(issues: SchemaIssue[]): SchemaError {
	if (issues.length === 0) {
		return new SchemaError('Unknown error');
	}
	return new ParseError(issues);
}

/**
 * Check if error is schema error
 */
export function isSchemaError(error: unknown): error is SchemaError {
	return error instanceof SchemaError;
}
