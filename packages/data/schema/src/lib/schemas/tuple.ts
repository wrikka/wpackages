import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Tuple schema - fixed-length array with typed elements
 */
export class TupleSchema<T extends readonly unknown[]> extends Schema<T> {
	constructor(private schemas: { [K in keyof T]: Schema<T[K]> }) {
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

		if (value.length !== this.schemas.length) {
			ctx.addIssue({
				code: "invalid_length",
				message: `Expected tuple of length ${this.schemas.length}, received ${value.length}`,
				value,
			});
			return value;
		}

		const result: unknown[] = [];
		for (let i = 0; i < this.schemas.length; i++) {
			const itemResult = this.schemas[i].safeParse(value[i]);
			if (itemResult.success) {
				result.push(itemResult.data);
			} else {
				ctx.issues.push(...itemResult.errors.map((e) => ({
					...e,
					path: [...ctx.path, i, ...e.path],
				})));
			}
		}

		return result as T;
	}

	protected _clone(): TupleSchema<T> {
		const cloned = new TupleSchema(this.schemas);
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
			type: "array",
			prefixItems: this.schemas.map((s) => s.toJSON()),
			minItems: this.schemas.length,
			maxItems: this.schemas.length,
			...(this._description && { description: this._description }),
		};
	}
}
