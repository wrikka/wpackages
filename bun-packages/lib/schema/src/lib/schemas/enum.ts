import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Enum schema - matches one of the enum values
 */
export class EnumSchema<T extends Record<string, string | number>> extends Schema<T[keyof T]> {
	constructor(private enumObj: T) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const values = Object.values(this.enumObj);
		if (!values.includes(value as string | number)) {
			ctx.addIssue({
				code: "invalid_enum",
				message: `Expected one of: ${values.join(", ")}`,
				value,
			});
		}
		return value;
	}

	protected _clone(): EnumSchema<T> {
		const cloned = new EnumSchema(this.enumObj);
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
			enum: Object.values(this.enumObj),
			...(this._description && { description: this._description }),
		};
	}
}
