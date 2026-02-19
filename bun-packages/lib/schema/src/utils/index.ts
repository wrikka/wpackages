/**
 * Utility functions for schema library
 */
import type { ParseContext, SchemaIssue } from "../types";
import { EMAIL_REGEX, URL_REGEX, UUID_REGEX } from "../constants";

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

// Re-export constants from constants layer
export { EMAIL_REGEX, URL_REGEX, UUID_REGEX };
