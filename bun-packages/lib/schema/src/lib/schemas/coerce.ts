import type { ParseContext } from "../../types";
import { BooleanSchema } from "./boolean";
import { NumberSchema } from "./number";
import { StringSchema } from "./string";

/**
 * Coerce string schema - coerces values to string
 */
export class CoerceStringSchema extends StringSchema {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "string") {
			value = String(value);
		}
		return super._validate(value, ctx);
	}

	protected _clone(): CoerceStringSchema {
		const cloned = new CoerceStringSchema();
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
		return super.toJSON();
	}
}

/**
 * Coerce number schema - coerces values to number
 */
export class CoerceNumberSchema extends NumberSchema {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "number") {
			const coerced = Number(value);
			if (Number.isNaN(coerced)) {
				ctx.addIssue({
					code: "invalid_coercion",
					message: `Cannot coerce ${typeof value} to number`,
					value,
				});
				return value;
			}
			value = coerced;
		}
		return super._validate(value, ctx);
	}

	protected _clone(): CoerceNumberSchema {
		const cloned = new CoerceNumberSchema();
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
		return super.toJSON();
	}
}

/**
 * Coerce boolean schema - coerces values to boolean
 */
export class CoerceBooleanSchema extends BooleanSchema {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "boolean") {
			value = Boolean(value);
		}
		return super._validate(value, ctx);
	}

	protected _clone(): CoerceBooleanSchema {
		const cloned = new CoerceBooleanSchema();
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
		return super.toJSON();
	}
}
