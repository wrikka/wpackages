/**
 * Utility functions for schema library
 */
import type { ParseContext, SchemaIssue } from "../types";

/**
 * Create a parse context for validation
 */
export function createParseContext(path: (string | number)[] = []): ParseContext {
	const issues: SchemaIssue[] = [];
	return {
		path,
		issues,
		addIssue: (issue) => {
			issues.push({
				path: issue.path || path,
				code: issue.code,
				message: issue.message,
				value: issue.value,
			});
		},
	};
}

/**
 * Email regex pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * URL regex pattern
 */
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * UUID regex pattern
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
