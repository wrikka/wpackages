import type { ParseContext, SchemaIssue } from "../../types";
import { Schema } from "../base";

/**
 * Union schema - matches any of the provided schemas
 */
export class UnionSchema<T extends readonly Schema<unknown>[]> extends Schema<
	T[number] extends Schema<infer U> ? U : never
> {
	constructor(private schemas: T) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const errors: SchemaIssue[] = [];

		for (const schema of this.schemas) {
			const result = schema.safeParse(value);
			if (result.success) {
				return result.data;
			}
			errors.push(...result.errors);
		}

		ctx.addIssue({
			code: "invalid_union",
			message: `Invalid input: must match one of ${this.schemas.length} schemas`,
			value,
		});

		return value;
	}

	protected _clone(): UnionSchema<T> {
		const cloned = new UnionSchema(this.schemas);
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
		return {
			oneOf: this.schemas.map((s) => s.toJSON()),
			...(this._description && { description: this._description }),
		};
	}
}
