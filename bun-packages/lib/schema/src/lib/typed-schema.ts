/**
 * TypeScript-first type inference utilities
 * Provides automatic type generation from schemas
 */

import { FluentSchema } from "./fluent-schema";

/**
 * Infer type from schema
 */
export type Infer<T extends FluentSchema<any>> = T extends FluentSchema<infer U> ? U : never;

/**
 * Infer input type from schema
 */
export type InferIn<T extends FluentSchema<any>> = T extends FluentSchema<infer U> ? U : never;

/**
 * Infer output type after transformation
 */
export type InferOut<T extends FluentSchema<any>> = T extends FluentSchema<infer U> ? U : never;

/**
 * Create typed schema factory
 */
export function createTypedSchema<T>(validator: (value: unknown) => T): FluentSchema<T> {
	return new class extends FluentSchema<T> {
		constructor() {
			super();
		}

		protected _validate(value: unknown): T {
			return validator(value);
		}

		protected _clone(): FluentSchema<T> {
			return new (this.constructor as any)();
		}

		toJSON(): Record<string, unknown> {
			return { type: 'custom' };
		}
	}();
}

/**
 * Type-safe schema builder
 */
export class SchemaBuilder {
	/**
	 * Create string schema
	 */
	static string(): FluentSchema<string> {
		return createTypedSchema((value: unknown): string => {
			if (typeof value !== 'string') {
				throw new Error(`Expected string, received ${typeof value}`);
			}
			return value;
		});
	}

	/**
	 * Create number schema
	 */
	static number(): FluentSchema<number> {
		return createTypedSchema((value: unknown): number => {
			if (typeof value !== 'number') {
				throw new Error(`Expected number, received ${typeof value}`);
			}
			return value;
		});
	}

	/**
	 * Create boolean schema
	 */
	static boolean(): FluentSchema<boolean> {
		return createTypedSchema((value: unknown): boolean => {
			if (typeof value !== 'boolean') {
				throw new Error(`Expected boolean, received ${typeof value}`);
			}
			return value;
		});
	}

	/**
	 * Create literal schema
	 */
	static literal<T extends string | number | boolean>(value: T): FluentSchema<T> {
		return createTypedSchema((input: unknown): T => {
			if (input !== value) {
				throw new Error(`Expected ${JSON.stringify(value)}, received ${JSON.stringify(input)}`);
			}
			return value;
		});
	}

	/**
	 * Create array schema
	 */
	static array<T>(itemSchema: FluentSchema<T>): FluentSchema<T[]> {
		return createTypedSchema((value: unknown): T[] => {
			if (!Array.isArray(value)) {
				throw new Error(`Expected array, received ${typeof value}`);
			}
			return value.map(item => itemSchema.parse(item));
		});
	}

	/**
	 * Create object schema
	 */
	static object<T extends Record<string, FluentSchema<any>>>(shape: T): FluentSchema<{ [K in keyof T]: Infer<T[K]> }> {
		const entries = Object.entries(shape);
		
		return createTypedSchema((value: unknown): { [K in keyof T]: Infer<T[K]> } => {
			if (typeof value !== 'object' || value === null) {
				throw new Error(`Expected object, received ${typeof value}`);
			}

			const result = {} as any;
			for (const [key, schema] of entries) {
				if (key in value) {
					result[key] = schema.parse((value as any)[key]);
				}
			}
			return result;
		});
	}
}

/**
 * Export typed schemas
 */
export const s = SchemaBuilder;
