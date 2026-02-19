/**
 * Schema composition utilities
 * Union, Intersection, and Lazy schemas
 */

import { FluentSchema } from "./fluent-schema";

/**
 * Union schema - value matches one of the schemas
 */
export class UnionSchema<T extends readonly FluentSchema<any>[]> extends FluentSchema<T[number] extends FluentSchema<infer U> ? U : never> {
	constructor(private schemas: T) {
		super();
	}

	protected _validate(value: unknown): T[number] extends FluentSchema<infer U> ? U : never {
		const errors: string[] = [];

		for (const schema of this.schemas) {
			const result = schema.safeParse(value);
			if (result.success) {
				return result.data;
			}
			errors.push(result.errors[0]?.message || 'Unknown error');
		}

		throw new Error(`Union validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
	}

	protected _clone(): UnionSchema<T> {
		return new UnionSchema(this.schemas);
	}

	toJSON(): Record<string, unknown> {
		return {
			type: 'union',
			schemas: this.schemas.map(s => s.toJSON())
		};
	}
}

/**
 * Intersection schema - value matches all schemas
 */
export class IntersectionSchema<T extends readonly FluentSchema<any>[]> extends FluentSchema<{
	[K in keyof T]: T[K] extends FluentSchema<infer U> ? U : never
}> {
	constructor(private schemas: T) {
		super();
	}

	protected _validate(value: unknown): {
		[K in keyof T]: T[K] extends FluentSchema<infer U> ? U : never
	} {
		const results: any[] = [];

		for (const schema of this.schemas) {
			const result = schema.safeParse(value);
			if (!result.success) {
				throw new Error(`Intersection validation failed: ${result.errors[0]?.message}`);
			}
			results.push(result.data);
		}

		// Merge results (simplified for common use cases)
		return results.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as any;
	}

	protected _clone(): IntersectionSchema<T> {
		return new IntersectionSchema(this.schemas);
	}

	toJSON(): Record<string, unknown> {
		return {
			type: 'intersection',
			schemas: this.schemas.map(s => s.toJSON())
		};
	}
}

/**
 * Lazy schema - for recursive schemas
 */
export class LazySchema<T> extends FluentSchema<T> {
	private resolvedSchema?: FluentSchema<T>;

	constructor(private schemaFn: () => FluentSchema<T>) {
		super();
	}

	private getSchema(): FluentSchema<T> {
		if (!this.resolvedSchema) {
			this.resolvedSchema = this.schemaFn();
		}
		return this.resolvedSchema;
	}

	protected _validate(value: unknown): T {
		return this.getSchema()._validate(value);
	}

	protected _clone(): LazySchema<T> {
		return new LazySchema(this.schemaFn);
	}

	toJSON(): Record<string, unknown> {
		return {
			type: 'lazy',
			schema: this.getSchema().toJSON()
		};
	}
}

/**
 * Union helper
 */
export function union<T extends readonly FluentSchema<any>[]>(schemas: T): UnionSchema<T> {
	return new UnionSchema(schemas);
}

/**
 * Intersection helper
 */
export function intersection<T extends readonly FluentSchema<any>[]>(schemas: T): IntersectionSchema<T> {
	return new IntersectionSchema(schemas);
}

/**
 * Lazy helper
 */
export function lazy<T>(schemaFn: () => FluentSchema<T>): LazySchema<T> {
	return new LazySchema(schemaFn);
}

/**
 * Extend SchemaBuilder with composition methods
 */
import { SchemaBuilder } from "./typed-schema";

SchemaBuilder.union = union;
SchemaBuilder.intersection = intersection;
SchemaBuilder.lazy = lazy;
