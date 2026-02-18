import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * BigInt schema
 */
export class BigIntSchema extends Schema<bigint> {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "bigint") {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected bigint, received ${typeof value}`,
				value,
			});
			return value;
		}
		return value;
	}

	protected _clone(): BigIntSchema {
		const cloned = new BigIntSchema();
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
			type: "integer",
			format: "int64",
			...(this._description && { description: this._description }),
		};
	}
}
