import type { ParseContext, SchemaShape } from "../../types";
import { Schema } from "../base";

/**
 * Discriminated Union schema - tagged unions with a discriminator field
 */
export class DiscriminatedUnionSchema<
	D extends string,
	T extends Record<D, string | number | boolean> & Record<string, unknown>,
> extends Schema<T> {
	private schemas: Map<string | number | boolean, Schema<unknown>> = new Map();

	constructor(
		private discriminator: D,
		private variants: { [K in T[D]]: Schema<T & Record<D, K>> },
	) {
		super();
		for (const [key, schema] of Object.entries(variants)) {
			this.schemas.set(key as T[D], schema as Schema<unknown>);
		}
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "object" || value === null) {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected object, received ${typeof value}`,
				value,
			});
			return value;
		}

		const discriminant = (value as Record<D, unknown>)[this.discriminator];

		if (discriminant === undefined) {
			ctx.addIssue({
				code: "missing_discriminator",
				message: `Missing discriminator field: ${this.discriminator}`,
				value,
			});
			return value;
		}

		const schema = this.schemas.get(discriminant as string | number | boolean);

		if (!schema) {
			ctx.addIssue({
				code: "invalid_discriminator",
				message: `Invalid ${this.discriminator}: ${discriminant}. Expected one of: ${
					Array.from(this.schemas.keys()).join(", ")
				}`,
				value,
			});
			return value;
		}

		const result = schema.safeParse(value);
		if (!result.success) {
			ctx.issues.push(...result.errors.map((e) => ({
				...e,
				path: [...ctx.path, this.discriminator, ...e.path],
			})));
			return value;
		}

		return result.data;
	}

	protected _clone(): DiscriminatedUnionSchema<D, T> {
		const cloned = new DiscriminatedUnionSchema(this.discriminator, this.variants);
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
		const schemas: Record<string, unknown>[] = [];
		for (const schema of this.schemas.values()) {
			schemas.push(schema.toJSON());
		}
		return {
			oneOf: schemas,
			discriminator: { propertyName: this.discriminator },
			...(this._description && { description: this._description }),
		};
	}
}
