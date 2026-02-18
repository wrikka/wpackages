import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Boolean schema
 */
export class BooleanSchema extends Schema<boolean> {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "boolean") {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected boolean, received ${typeof value}`,
				value,
			});
			return value;
		}
		return value;
	}

	protected _clone(): BooleanSchema {
		const cloned = new BooleanSchema();
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
			type: "boolean",
			...(this._description && { description: this._description }),
		};
	}
}
