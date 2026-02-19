/**
 * Detailed error messages system
 * Provides clear, actionable error messages with localization support
 */

import type { SchemaIssue } from "../types";

/**
 * Error message templates
 */
export const errorTemplates = {
	// Type errors
	type_mismatch: (expected: string, received: string) => 
		`Expected type ${expected}, but received ${received}`,
	
	// String validation
	string_empty: () => 'String cannot be empty',
	string_min_length: (min: number) => `String must be at least ${min} characters long`,
	string_max_length: (max: number) => `String cannot be more than ${max} characters long`,
	string_email: () => 'Invalid email format',
	string_url: () => 'Invalid URL format',
	string_uuid: () => 'Invalid UUID format',
	string_pattern: (pattern: string) => `String does not match required pattern: ${pattern}`,
	
	// Number validation
	number_min: (min: number) => `Number must be at least ${min}`,
	number_max: (max: number) => `Number cannot be more than ${max}`,
	number_range: (min: number, max: number) => `Number must be between ${min} and ${max}`,
	number_positive: () => 'Number must be positive',
	number_integer: () => 'Number must be an integer',
	
	// Array validation
	array_empty: () => 'Array cannot be empty',
	array_min_length: (min: number) => `Array must have at least ${min} items`,
	array_max_length: (max: number) => `Array cannot have more than ${max} items`,
	array_unique: () => 'Array items must be unique',
	
	// Object validation
	object_required: (field: string) => `Required field '${field}' is missing`,
	object_unknown: (field: string) => `Unknown field '${field}' is not allowed`,
	object_strict: () => 'Object contains unknown properties',
	
	// Custom validation
	custom: (message?: string) => message || 'Validation failed',
	async_failed: (operation: string) => `Async validation failed for ${operation}`,
	
	// Union/Intersection
	union_no_match: () => 'Value does not match any allowed type',
	intersection_failed: () => 'Value does not satisfy all required types',
	
	// Transform errors
	transform_failed: (from: string, to: string) => `Cannot transform from ${from} to ${to}`,
	parse_failed: (value: string, type: string) => `Cannot parse "${value}" as ${type}`,
};

/**
 * Error message builder
 */
export class ErrorMessageBuilder {
	private locale: string = 'en';
	private customTemplates: Record<string, Function> = {};

	/**
	 * Set locale
	 */
	setLocale(locale: string): this {
		this.locale = locale;
		return this;
	}

	/**
	 * Add custom template
	 */
	addTemplate(key: string, template: Function): this {
		this.customTemplates[key] = template;
		return this;
	}

	/**
	 * Get error message
	 */
	getMessage(code: string, params?: Record<string, any>): string {
		const template = this.customTemplates[code] || errorTemplates[code as keyof typeof errorTemplates];
		if (!template) {
			return `Unknown error: ${code}`;
		}
		
		if (typeof template === 'function') {
			return template(params);
		}
		
		return template;
	}

	/**
	 * Create schema issue
	 */
	createIssue(code: string, path: (string | number)[] = [], params?: Record<string, any>): SchemaIssue {
		return {
			path,
			code,
			message: this.getMessage(code, params),
			value: params?.value
		};
	}

	/**
	 * Format path for display
	 */
	formatPath(path: (string | number)[]): string {
		return path.length === 0 ? 'root' : path.join('.');
	}

	/**
	 * Create detailed error report
	 */
	createErrorReport(issues: SchemaIssue[]): string {
		if (issues.length === 0) {
			return 'No validation errors';
		}

		const lines = [
			`🚨 Validation failed with ${issues.length} error(s):`,
			'',
		];

		for (const issue of issues) {
			const path = this.formatPath(issue.path);
			const line = `  ❌ ${path}: ${issue.message}`;
			lines.push(line);
			
			if (issue.value !== undefined) {
				lines.push(`     Value: ${JSON.stringify(issue.value)}`);
			}
		}

		lines.push('');
		lines.push('💡 Fix suggestions:');
		lines.push(this.getSuggestions(issues));

		return lines.join('\n');
	}

	/**
	 * Get fix suggestions based on error codes
	 */
	private getSuggestions(issues: SchemaIssue[]): string {
		const suggestions: string[] = [];

		for (const issue of issues) {
			switch (issue.code) {
				case 'type_mismatch':
					suggestions.push(`  • Check the type of ${this.formatPath(issue.path)}`);
					break;
				case 'string_email':
					suggestions.push(`  • Verify email format at ${this.formatPath(issue.path)}`);
					break;
				case 'string_min_length':
					suggestions.push(`  • Add more characters to ${this.formatPath(issue.path)}`);
					break;
				case 'object_required':
					suggestions.push(`  • Add required field: ${issue.message?.match(/'([^']+)'/)?.[1] || 'unknown'}`);
					break;
				case 'custom':
					suggestions.push(`  • ${issue.message}`);
					break;
				default:
					suggestions.push(`  • Review ${this.formatPath(issue.path)} - ${issue.code}`);
			}
		}

		return [...new Set(suggestions)].join('\n');
	}
}

/**
 * Global error message builder instance
 */
export const errorBuilder = new ErrorMessageBuilder();

/**
 * Helper functions
 */
export const createError = {
	type: (expected: string, received: string, path?: (string | number)[]) =>
		errorBuilder.createIssue('type_mismatch', path, { expected, received }),
	
	email: (path?: (string | number)[]) =>
		errorBuilder.createIssue('string_email', path),
	
	minLength: (min: number, path?: (string | number)[]) =>
		errorBuilder.createIssue('string_min_length', path, { min }),
	
	maxLength: (max: number, path?: (string | number)[]) =>
		errorBuilder.createIssue('string_max_length', path, { max }),
	
	required: (field: string, path?: (string | number)[]) =>
		errorBuilder.createIssue('object_required', path, { field }),
	
	custom: (message: string, path?: (string | number)[]) =>
		errorBuilder.createIssue('custom', path, { message }),
};
