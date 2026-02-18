import type { InferShape, ParseContext, SchemaShape } from "../../types";
import { Schema } from "../base";

export type { SchemaShape } from "../../types";

/**
 * Object schema with fluent API
 */
export class ObjectSchema<T extends SchemaShape> extends Schema<InferShape<T>> {
	constructor(private shape: T) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected object, received ${Array.isArray(value) ? "array" : typeof value}`,
				value,
			});
			return value;
		}

		const result: Record<string, unknown> = {};
		const inputObj = value as Record<string, unknown>;

		for (const [key, schema] of Object.entries(this.shape)) {
			const fieldResult = (schema as Schema<unknown>).safeParse(inputObj[key]);

			if (fieldResult.success) {
				result[key] = fieldResult.data;
			} else {
				ctx.issues.push(...fieldResult.errors.map((e) => ({
					...e,
					path: [...ctx.path, key, ...e.path],
				})));
			}
		}

		// Check for extra keys (strict mode)
		const inputKeys = Object.keys(inputObj);
		const shapeKeys = Object.keys(this.shape);
		const extraKeys = inputKeys.filter((k) => !shapeKeys.includes(k));

		if (extraKeys.length > 0) {
			for (const key of extraKeys) {
				ctx.addIssue({
					path: [...ctx.path, key],
					code: "unrecognized_key",
					message: `Unrecognized key: ${key}`,
					value: inputObj[key],
				});
			}
		}

		return result;
	}

	pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
		const pickedShape = {} as Pick<T, K>;
		for (const key of keys) {
			pickedShape[key] = this.shape[key];
		}
		return new ObjectSchema(pickedShape);
	}

	omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
		const omittedShape = {} as Omit<T, K>;
		for (const key of Object.keys(this.shape)) {
			if (!keys.includes(key as K)) {
				(omittedShape as Record<string, Schema<unknown>>)[key] = this.shape[key];
			}
		}
		return new ObjectSchema(omittedShape);
	}

	extend<U extends SchemaShape>(extension: U): ObjectSchema<T & U> {
		return new ObjectSchema({ ...this.shape, ...extension } as T & U);
	}

	merge<U extends SchemaShape>(other: ObjectSchema<U>): ObjectSchema<T & U> {
		return new ObjectSchema({ ...this.shape, ...other.shape } as T & U);
	}

	partial(): ObjectSchema<{ [K in keyof T]: Schema<T[K] extends Schema<infer U> ? U | undefined : never> }> {
		const partialShape = {} as { [K in keyof T]: Schema<T[K] extends Schema<infer U> ? U | undefined : never> };
		for (const [key, schema] of Object.entries(this.shape)) {
			(partialShape as Record<string, Schema<unknown>>)[key] = (schema as Schema<unknown>).optional();
		}
		return new ObjectSchema(partialShape);
	}

	protected _clone(): ObjectSchema<T> {
		const cloned = new ObjectSchema(this.shape);
		cloned.validators = [...this.validators];
		cloned.transforms = [...this.transforms];
		cloned._optional = this._optional;
		cloned._nullable = this._nullable;
		cloned._default = this._default;
		cloned._description = this._description;
		cloned._brand = this._brand;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const properties: Record<string, unknown> = {};
		const required: string[] = [];

		for (const [key, schema] of Object.entries(this.shape)) {
			properties[key] = (schema as Schema<unknown>).toJSON();
			if (!(schema as Schema<unknown>)["_optional"]) {
				required.push(key);
			}
		}

		return {
			type: "object",
			properties,
			...(required.length > 0 && { required }),
			...(this._description && { description: this._description }),
		};
	}
}
