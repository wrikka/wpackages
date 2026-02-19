/**
 * Custom validation system
 * Extensible validation with custom rules
 */

import { FluentSchema } from "./fluent-schema";
import type { SafeParseResult, SchemaIssue } from "../types";

/**
 * Custom validator function type
 */
export type CustomValidator<T> = (value: T) => boolean | string;

/**
 * Validation rule interface
 */
export interface ValidationRule<T> {
	name: string;
	validator: CustomValidator<T>;
	message?: string;
}

/**
 * Schema with custom validation support
 */
export class ValidatedSchema<T> extends FluentSchema<T> {
	private rules: ValidationRule<T>[] = [];

	/**
	 * Add validation rule
	 */
	rule(name: string, validator: CustomValidator<T>, message?: string): this {
		this.rules.push({ name, validator, message });
		return this;
	}

	/**
	 * Email validation
	 */
	email(message?: string): this {
		return this.rule('email', (value: T) => {
			if (typeof value !== 'string') return false;
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(value);
		}, message || 'Invalid email format');
	}

	/**
	 * Min length validation
	 */
	minLength(min: number, message?: string): this {
		return this.rule('minLength', (value: T) => {
			if (typeof value !== 'string' && !Array.isArray(value)) return false;
			return value.length >= min;
		}, message || `Minimum length is ${min}`);
	}

	/**
	 * Max length validation
	 */
	maxLength(max: number, message?: string): this {
		return this.rule('maxLength', (value: T) => {
			if (typeof value !== 'string' && !Array.isArray(value)) return false;
			return value.length <= max;
		}, message || `Maximum length is ${max}`);
	}

	/**
	 * Range validation for numbers
	 */
	range(min: number, max: number, message?: string): this {
		return this.rule('range', (value: T) => {
			if (typeof value !== 'number') return false;
			return value >= min && value <= max;
		}, message || `Value must be between ${min} and ${max}`);
	}

	/**
	 * Pattern validation
	 */
	pattern(regex: RegExp, message?: string): this {
		return this.rule('pattern', (value: T) => {
			if (typeof value !== 'string') return false;
			return regex.test(value);
		}, message || 'Invalid format');
	}

	/**
	 * UUID validation
	 */
	uuid(message?: string): this {
		return this.rule('uuid', (value: T) => {
			if (typeof value !== 'string') return false;
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			return uuidRegex.test(value);
		}, message || 'Invalid UUID format');
	}

	/**
	 * URL validation
	 */
	url(message?: string): this {
		return this.rule('url', (value: T) => {
			if (typeof value !== 'string') return false;
			try {
				new URL(value);
				return true;
			} catch {
				return false;
			}
		}, message || 'Invalid URL format');
	}

	/**
	 * Custom validation with all rules
	 */
	protected _validate(value: unknown): T {
		const baseValidated = super._validate(value);
		
		// Apply all validation rules
		for (const rule of this.rules) {
			const result = rule.validator(baseValidated);
			if (result === false) {
				throw new Error(rule.message || `Validation failed: ${rule.name}`);
			}
			if (typeof result === 'string') {
				throw new Error(result);
			}
		}

		return baseValidated;
	}

	protected _clone(): ValidatedSchema<T> {
		const cloned = new ValidatedSchema<T>();
		cloned.rules = [...this.rules];
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const baseSchema = super.toJSON();
		return {
			...baseSchema,
			rules: this.rules.map(r => r.name)
		};
	}
}

/**
 * Built-in validators
 */
export const validators = {
	email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
	uuid: (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
	url: (value: string) => {
		try {
			new URL(value);
			return true;
		} catch {
			return false;
		}
	},
	minLength: (min: number) => (value: string | any[]) => value.length >= min,
	maxLength: (max: number) => (value: string | any[]) => value.length <= max,
	range: (min: number, max: number) => (value: number) => value >= min && value <= max,
	pattern: (regex: RegExp) => (value: string) => regex.test(value),
};
