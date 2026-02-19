import type { ParseContext, SafeParseResult, SchemaIssue, Transform, Validator } from "../../types";
import { createParseContext } from "../../utils";
import { SchemaError } from "../../error";

/**
 * Schema Parse Error - Legacy class for backward compatibility
 * @deprecated Use SchemaError from error layer instead
 */
export class SchemaParseError extends SchemaError {
	constructor(public readonly errors: SchemaIssue[]) {
		const message = errors.map((e) => `[${e.path.join(".")}] ${e.message}`).join("\n");
		super(message, errors);
		Object.defineProperty(this, 'name', { value: 'SchemaParseError' });
	}
}

/**
 * Async Schema wrapper
 */
export class AsyncSchema<T> {
	constructor(private schema: Schema<T>) { }

	async parse(value: unknown): Promise<T> {
		const result = await this.safeParse(value);
		if (!result.success) {
			throw new SchemaParseError(result.errors);
		}
		return result.data;
	}

	async safeParse(value: unknown): Promise<SafeParseResult<T>> {
		return this.schema.safeParse(value);
	}
}

/**
 * Base class for all schemas with fluent API
 */
export abstract class Schema<T> {
	readonly _type!: T;

	protected validators: Validator<unknown>[] = [];
	protected transforms: Transform<unknown, unknown>[] = [];
	protected _description?: string;
	protected _optional = false;
	protected _nullable = false;
	protected _default?: T | (() => T);
	protected _brand?: string;

	/**
	 * Parse value and return result or throw error
	 */
	parse(value: unknown): T {
		const result = this.safeParse(value);
		if (!result.success) {
			throw new SchemaParseError(result.errors);
		}
		return result.data;
	}

	/**
	 * Parse value safely without throwing
	 */
	safeParse(value: unknown): SafeParseResult<T> {
		const ctx = createParseContext();

		// Handle optional
		if (this._optional && (value === undefined)) {
			return { success: true, data: value as T };
		}

		// Handle nullable
		if (this._nullable && (value === null)) {
			return { success: true, data: value as T };
		}

		// Handle default
		if ((value === undefined) && (this._default !== undefined)) {
			value = typeof this._default === "function"
				? (this._default as () => T)()
				: this._default;
		}

		// Core validation
		let processed = this._validate(value, ctx);

		// Apply custom validators
		for (const validator of this.validators) {
			const valid = validator(processed, ctx);
			if (valid === false) break;
		}

		// Apply transformations
		for (const transform of this.transforms) {
			processed = transform(processed);
		}

		if (ctx.issues.length > 0) {
			return { success: false, errors: ctx.issues };
		}

		return { success: true, data: processed as T };
	}

	/**
	 * Abstract method for core validation
	 */
	protected abstract _validate(value: unknown, ctx: ParseContext): unknown;

	/**
	 * Add custom validation
	 */
	refine(validator: Validator<T>, message?: string): this {
		this.validators.push((val, ctx) => {
			const result = validator(val as T, ctx);
			if (result === false) {
				ctx.addIssue({
					code: "custom",
					message: message || "Invalid value",
				});
				return false;
			}
			return true;
		});
		return this;
	}

	/**
	 * Add transformation
	 */
	transform<U>(fn: Transform<T, U>): Schema<U> {
		const newSchema = this._clone() as unknown as Schema<U>;
		newSchema.transforms.push(fn as Transform<unknown, unknown>);
		return newSchema;
	}

	/**
	 * Make schema optional
	 */
	optional(): Schema<T | undefined> {
		const cloned = this._clone() as Schema<T | undefined>;
		cloned._optional = true;
		return cloned;
	}

	/**
	 * Make schema nullable
	 */
	nullable(): Schema<T | null> {
		const cloned = this._clone() as Schema<T | null>;
		cloned._nullable = true;
		return cloned;
	}

	/**
	 * Make schema both optional and nullable
	 */
	nullish(): Schema<T | null | undefined> {
		return this.optional().nullable() as Schema<T | null | undefined>;
	}

	/**
	 * Set default value
	 */
	default(value: T | (() => T)): Schema<T> {
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
	 * Create branded type
	 */
	brand<B extends string>(name: B): Schema<T & { __brand: B }> {
		const cloned = this._clone() as Schema<T & { __brand: B }>;
		cloned._brand = name;
		return cloned;
	}

	/**
	 * Create async schema (lazy evaluation marker)
	 */
	async(): AsyncSchema<T> {
		return new AsyncSchema(this);
	}

	/**
	 * Convert schema to JSON Schema format
	 */
	abstract toJSON(): Record<string, unknown>;

	/**
	 * Clone schema
	 */
	protected abstract _clone(): Schema<T>;
}
