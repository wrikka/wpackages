import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Intersection schema - combines multiple schemas
 */
export class IntersectionSchema<T extends Schema<unknown>, U extends Schema<unknown>> extends Schema<
	T extends Schema<infer A> ? (U extends Schema<infer B> ? A & B : never) : never
> {
	constructor(private left: T, private right: U) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const leftResult = this.left.safeParse(value);
		const rightResult = this.right.safeParse(value);

		if (!leftResult.success) {
			ctx.issues.push(...leftResult.errors);
		}

		if (!rightResult.success) {
			ctx.issues.push(...rightResult.errors);
		}

		if (leftResult.success && rightResult.success) {
			return { ...leftResult.data, ...rightResult.data };
		}

		return value;
	}

	protected _clone(): IntersectionSchema<T, U> {
		const cloned = new IntersectionSchema(this.left, this.right);
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
			allOf: [this.left.toJSON(), this.right.toJSON()],
			...(this._description && { description: this._description }),
		};
	}
}
