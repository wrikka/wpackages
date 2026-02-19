/**
 * Async validation support
 * Handle asynchronous validation operations
 */

import { FluentSchema } from "./fluent-schema";
import type { SafeParseResult, SchemaIssue } from "../types";

/**
 * Async validator function type
 */
export type AsyncValidator<T> = (value: T) => Promise<boolean | string>;

/**
 * Async validation rule
 */
export interface AsyncValidationRule<T> {
	name: string;
	validator: AsyncValidator<T>;
	message?: string;
}

/**
 * Async schema wrapper
 */
export class AsyncSchema<T> extends FluentSchema<T> {
	private asyncRules: AsyncValidationRule<T>[] = [];

	/**
	 * Add async validation rule
	 */
	asyncRule(name: string, validator: AsyncValidator<T>, message?: string): this {
		this.asyncRules.push({ name, validator, message });
		return this;
	}

	/**
	 * Async email validation
	 */
	asyncEmail(message?: string): this {
		return this.asyncRule('asyncEmail', async (value: T) => {
			if (typeof value !== 'string') return false;
			
			// Simulate async email validation (e.g., check against external service)
			await new Promise(resolve => setTimeout(resolve, 1));
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(value);
		}, message || 'Invalid email format');
	}

	/**
	 * Async unique validation
	 */
	asyncUnique<T>(checkFn: (value: T) => Promise<boolean>, message?: string): this {
		return this.asyncRule('asyncUnique', async (value: T) => {
			const isUnique = await checkFn(value);
			return isUnique;
		}, message || 'Value must be unique');
	}

	/**
	 * Async custom validation
	 */
	asyncRefine(validator: AsyncValidator<T>, message?: string): this {
		return this.asyncRule('asyncRefine', validator, message);
	}

	/**
	 * Async safe parse
	 */
	async safeParse(value: unknown): Promise<SafeParseResult<T>> {
		// Handle sync validation first
		const syncResult = super.safeParse(value);
		if (!syncResult.success) {
			return syncResult;
		}

		// Apply async validation rules
		const validatedValue = syncResult.data;
		const errors: SchemaIssue[] = [];

		for (const rule of this.asyncRules) {
			try {
				const result = await rule.validator(validatedValue);
				if (result === false) {
					errors.push({
						path: [],
						message: rule.message || `Async validation failed: ${rule.name}`,
						code: 'async_validation_error'
					});
				} else if (typeof result === 'string') {
					errors.push({
						path: [],
						message: result,
						code: 'async_validation_error'
					});
				}
			} catch (error) {
				errors.push({
					path: [],
					message: error instanceof Error ? error.message : 'Unknown async validation error',
					code: 'async_validation_error'
				});
			}
		}

		if (errors.length > 0) {
			return { success: false, errors };
		}

		return { success: true, data: validatedValue };
	}

	/**
	 * Async parse
	 */
	async parse(value: unknown): Promise<T> {
		const result = await this.safeParse(value);
		if (!result.success) {
			const message = result.errors
				.map(e => `[${e.path.join('.')}] ${e.message}`)
				.join('\n');
			throw new Error(message);
		}
		return result.data;
	}

	protected _clone(): AsyncSchema<T> {
		const cloned = new AsyncSchema<T>();
		cloned.asyncRules = [...this.asyncRules];
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const baseSchema = super.toJSON();
		return {
			...baseSchema,
			asyncRules: this.asyncRules.map(r => r.name),
			async: true
		};
	}
}

/**
 * Convert sync schema to async
 */
export function toAsync<T>(schema: FluentSchema<T>): AsyncSchema<T> {
	const asyncSchema = new AsyncSchema<T>();
	
	// Copy properties
	(asyncSchema as any)._optional = (schema as any)._optional;
	(asyncSchema as any)._nullable = (schema as any)._nullable;
	(asyncSchema as any)._default = (schema as any)._default;
	(asyncSchema as any)._description = (schema as any)._description;
	
	// Copy validation method
	asyncSchema._validate = schema._validate.bind(schema);
	
	return asyncSchema;
}

/**
 * Built-in async validators
 */
export const asyncValidators = {
	email: async (value: string) => {
		// Simulate network request to validate email
		await new Promise(resolve => setTimeout(resolve, 10));
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	},
	unique: async <T>(value: T, checkFn: (value: T) => Promise<boolean>) => {
		return await checkFn(value);
	},
	exists: async (value: string, checkFn: (value: string) => Promise<boolean>) => {
		return await checkFn(value);
	},
};
