import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Literal schema - matches exact value
 */
export class LiteralSchema<T extends string | number | boolean | null | undefined | bigint> extends Schema<T> {
	constructor(private literal: T) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (value !== this.literal) {
			ctx.addIssue({
				code: "invalid_literal",
				message: `Expected literal ${String(this.literal)}, received ${String(value)}`,
				value,
			});
		}
		return value;
	}

	protected _clone(): LiteralSchema<T> {
		const cloned = new LiteralSchema(this.literal);
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
			const: this.literal,
			...(this._description && { description: this._description }),
		};
	}
}
