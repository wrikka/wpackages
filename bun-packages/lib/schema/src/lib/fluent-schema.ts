/**
 * Fluent API extensions for minimal schema
 * Adds method chaining capabilities
 */

import { MinimalSchema } from "./minimal-base";

/**
 * Extend minimal schema with fluent methods
 */
export abstract class FluentSchema<T> extends MinimalSchema<T> {
	protected _optional = false;
	protected _nullable = false;
	protected _default?: T | (() => T);
	protected _description?: string;

	/**
	 * Make schema optional
	 */
	optional(): FluentSchema<T | undefined> {
		const cloned = this._clone() as FluentSchema<T | undefined>;
		cloned._optional = true;
		return cloned;
	}

	/**
	 * Make schema nullable
	 */
	nullable(): FluentSchema<T | null> {
		const cloned = this._clone() as FluentSchema<T | null>;
		cloned._nullable = true;
		return cloned;
	}

	/**
	 * Make schema both optional and nullable
	 */
	nullish(): FluentSchema<T | null | undefined> {
		return this.optional().nullable() as FluentSchema<T | null | undefined>;
	}

	/**
	 * Set default value
	 */
	default(value: T | (() => T)): FluentSchema<T> {
		const cloned = this._clone();
		cloned._default = value;
		return cloned;
	}

	/**
	 * Add description
	 */
	description(desc: string): this {
		this._description = desc;
		return this;
	}

	/**
	 * Add custom validation
	 */
	refine(validator: (value: T) => boolean, message?: string): this {
		const originalValidate = this._validate.bind(this);
		this._validate = (value: unknown) => {
			const validated = originalValidate(value);
			if (typeof validated === 'undefined' || validated === null) {
				return validated;
			}

			if (!validator(validated)) {
				throw new Error(message || "Custom validation failed");
			}
			return validated;
		};
		return this;
	}

	/**
	 * Transform value
	 */
	transform<U>(fn: (value: T) => U): FluentSchema<U> {
		const originalValidate = this._validate.bind(this);
		const transformedSchema = new (this.constructor as any)();

		transformedSchema._validate = (value: unknown) => {
			const validated = originalValidate(value);
			if (typeof validated === 'undefined' || validated === null) {
				return validated as any;
			}
			return fn(validated);
		};

		return transformedSchema as FluentSchema<U>;
	}

	/**
	 * Enhanced safeParse with optional/nullish handling
	 */
	safeParse(value: unknown): SafeParseResult<T> {
		// Handle optional
		if (this._optional && value === undefined) {
			return { success: true, data: value as T };
		}

		// Handle nullable
		if (this._nullable && value === null) {
			return { success: true, data: value as T };
		}

		// Handle default
		if (value === undefined && this._default !== undefined) {
			value = typeof this._default === "function"
				? (this._default as () => T)()
				: this._default;
		}

		try {
			const data = this._validate(value);
			return { success: true, data };
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false,
					errors: [{
						path: [],
						message: error.message,
						code: 'validation_error'
					}]
				};
			}
			throw error;
		}
	}

	/**
	 * Clone with all properties
	 */
	protected abstract _clone(): FluentSchema<T>;
}
