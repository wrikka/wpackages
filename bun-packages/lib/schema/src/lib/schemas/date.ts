import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Date schema with fluent API
 */
export class DateSchema extends Schema<Date> {
	private _min?: Date;
	private _max?: Date;

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		let date: Date;

		if (value instanceof Date) {
			date = value;
		} else if (typeof value === "string" || typeof value === "number") {
			date = new Date(value);
		} else {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected Date, received ${typeof value}`,
				value,
			});
			return value;
		}

		if (Number.isNaN(date.getTime())) {
			ctx.addIssue({
				code: "invalid_date",
				message: "Invalid date",
				value,
			});
			return value;
		}

		if (this._min && date < this._min) {
			ctx.addIssue({
				code: "too_small",
				message: `Date must be after ${this._min.toISOString()}`,
				value: date,
			});
		}

		if (this._max && date > this._max) {
			ctx.addIssue({
				code: "too_big",
				message: `Date must be before ${this._max.toISOString()}`,
				value: date,
			});
		}

		return date;
	}

	min(date: Date): this {
		const cloned = this._clone();
		cloned._min = date;
		return cloned;
	}

	max(date: Date): this {
		const cloned = this._clone();
		cloned._max = date;
		return cloned;
	}

	protected _clone(): DateSchema {
		const cloned = new DateSchema();
		cloned.validators = [...this.validators];
		cloned.transforms = [...this.transforms];
		cloned._optional = this._optional;
		cloned._nullable = this._nullable;
		cloned._default = this._default;
		cloned._description = this._description;
		cloned._brand = this._brand;
		cloned._min = this._min;
		cloned._max = this._max;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const json: Record<string, unknown> = { type: "string", format: "date-time" };
		if (this._min) json.minimum = this._min.toISOString();
		if (this._max) json.maximum = this._max.toISOString();
		if (this._description) json.description = this._description;
		return json;
	}
}
