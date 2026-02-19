import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Array schema with fluent API
 */
export class ArraySchema<T> extends Schema<T[]> {
	private _min?: number;
	private _max?: number;
	private _length?: number;
	private _nonempty = false;

	constructor(private itemSchema: Schema<T>) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (!Array.isArray(value)) {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected array, received ${typeof value}`,
				value,
			});
			return value;
		}

		if (this._nonempty && (value.length === 0)) {
			ctx.addIssue({
				code: "too_small",
				message: "Array must contain at least 1 element",
				value,
			});
		}

		if ((this._min !== undefined) && (value.length < this._min)) {
			ctx.addIssue({
				code: "too_small",
				message: `Array must contain at least ${this._min} element(s)`,
				value,
			});
		}

		if ((this._max !== undefined) && (value.length > this._max)) {
			ctx.addIssue({
				code: "too_big",
				message: `Array must contain at most ${this._max} element(s)`,
				value,
			});
		}

		if ((this._length !== undefined) && (value.length !== this._length)) {
			ctx.addIssue({
				code: "invalid_length",
				message: `Array must contain exactly ${this._length} element(s)`,
				value,
			});
		}

		const result: T[] = [];
		for (let i = 0; i < value.length; i++) {
			const itemResult = this.itemSchema.safeParse(value[i]);

			if (itemResult.success) {
				result.push(itemResult.data);
			} else {
				ctx.issues.push(...itemResult.errors.map((e) => ({
					...e,
					path: [...ctx.path, i, ...e.path],
				})));
			}
		}

		return result;
	}

	min(length: number): this {
		const cloned = this._clone();
		cloned._min = length;
		return cloned;
	}

	max(length: number): this {
		const cloned = this._clone();
		cloned._max = length;
		return cloned;
	}

	length(len: number): this {
		const cloned = this._clone();
		cloned._length = len;
		return cloned;
	}

	nonempty(): this {
		const cloned = this._clone();
		cloned._nonempty = true;
		return cloned;
	}

	protected _clone(): ArraySchema<T> {
		const cloned = new ArraySchema(this.itemSchema);
		cloned.validators = [...this.validators];
		cloned.transforms = [...this.transforms];
		cloned._optional = this._optional;
		cloned._nullable = this._nullable;
		cloned._default = this._default;
		cloned._description = this._description;
		cloned._brand = this._brand;
		cloned._min = this._min;
		cloned._max = this._max;
		cloned._length = this._length;
		cloned._nonempty = this._nonempty;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const json: Record<string, unknown> = {
			type: "array",
			items: this.itemSchema.toJSON(),
		};
		if (this._min !== undefined) json.minItems = this._min;
		if (this._max !== undefined) json.maxItems = this._max;
		if (this._length !== undefined) {
			json.minItems = this._length;
			json.maxItems = this._length;
		}
		if (this._description) json.description = this._description;
		return json;
	}
}

import { Schema as SchemaType } from "../base";
export { SchemaType as Schema };
