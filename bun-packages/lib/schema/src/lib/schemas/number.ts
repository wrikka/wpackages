import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Number schema with fluent API
 */
export class NumberSchema extends Schema<number> {
	private _min?: number;
	private _max?: number;
	private _int = false;
	private _positive = false;
	private _negative = false;
	private _finite = false;
	private _multipleOf?: number;

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "number" || Number.isNaN(value)) {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected number, received ${typeof value}`,
				value,
			});
			return value;
		}

		if (this._int && !Number.isInteger(value)) {
			ctx.addIssue({
				code: "not_int",
				message: "Expected integer",
				value,
			});
		}

		if (this._finite && !Number.isFinite(value)) {
			ctx.addIssue({
				code: "not_finite",
				message: "Expected finite number",
				value,
			});
		}

		if (this._positive && (value <= 0)) {
			ctx.addIssue({
				code: "not_positive",
				message: "Expected positive number",
				value,
			});
		}

		if (this._negative && (value >= 0)) {
			ctx.addIssue({
				code: "not_negative",
				message: "Expected negative number",
				value,
			});
		}

		if ((this._min !== undefined) && (value < this._min)) {
			ctx.addIssue({
				code: "too_small",
				message: `Number must be greater than or equal to ${this._min}`,
				value,
			});
		}

		if ((this._max !== undefined) && (value > this._max)) {
			ctx.addIssue({
				code: "too_big",
				message: `Number must be less than or equal to ${this._max}`,
				value,
			});
		}

		if ((this._multipleOf !== undefined) && ((value % this._multipleOf) !== 0)) {
			ctx.addIssue({
				code: "not_multiple",
				message: `Number must be a multiple of ${this._multipleOf}`,
				value,
			});
		}

		return value;
	}

	min(value: number): this {
		const cloned = this._clone();
		cloned._min = value;
		return cloned;
	}

	max(value: number): this {
		const cloned = this._clone();
		cloned._max = value;
		return cloned;
	}

	int(): this {
		const cloned = this._clone();
		cloned._int = true;
		return cloned;
	}

	positive(): this {
		const cloned = this._clone();
		cloned._positive = true;
		return cloned;
	}

	negative(): this {
		const cloned = this._clone();
		cloned._negative = true;
		return cloned;
	}

	finite(): this {
		const cloned = this._clone();
		cloned._finite = true;
		return cloned;
	}

	multipleOf(value: number): this {
		const cloned = this._clone();
		cloned._multipleOf = value;
		return cloned;
	}

	protected _clone(): NumberSchema {
		const cloned = new NumberSchema();
		cloned.validators = [...this.validators];
		cloned.transforms = [...this.transforms];
		cloned._optional = this._optional;
		cloned._nullable = this._nullable;
		cloned._default = this._default;
		cloned._description = this._description;
		cloned._brand = this._brand;
		cloned._min = this._min;
		cloned._max = this._max;
		cloned._int = this._int;
		cloned._positive = this._positive;
		cloned._negative = this._negative;
		cloned._finite = this._finite;
		cloned._multipleOf = this._multipleOf;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const json: Record<string, unknown> = { type: this._int ? "integer" : "number" };
		if (this._min !== undefined) json.minimum = this._min;
		if (this._max !== undefined) json.maximum = this._max;
		if (this._multipleOf !== undefined) json.multipleOf = this._multipleOf;
		if (this._positive) json.exclusiveMinimum = 0;
		if (this._negative) json.exclusiveMaximum = 0;
		if (this._description) json.description = this._description;
		return json;
	}
}
