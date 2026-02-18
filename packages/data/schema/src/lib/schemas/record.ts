import type { ParseContext, SchemaShape } from "../../types";
import { Schema } from "../base";

/**
 * Record schema - object with dynamic string keys
 */
export class RecordSchema<K extends string | number, V> extends Schema<Record<K, V>> {
	constructor(
		private keySchema: Schema<K>,
		private valueSchema: Schema<V>,
	) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected object, received ${Array.isArray(value) ? "array" : typeof value}`,
				value,
			});
			return value;
		}

		const result: Record<K, V> = {} as Record<K, V>;
		const inputObj = value as Record<string, unknown>;

		for (const [key, val] of Object.entries(inputObj)) {
			const keyResult = this.keySchema.safeParse(key as unknown);
			const valueResult = this.valueSchema.safeParse(val);

			if (keyResult.success && valueResult.success) {
				result[key as K] = valueResult.data;
			} else {
				if (!keyResult.success) {
					ctx.issues.push(...keyResult.errors.map((e) => ({
						...e,
						path: [...ctx.path, key, ...e.path],
					})));
				}
				if (!valueResult.success) {
					ctx.issues.push(...valueResult.errors.map((e) => ({
						...e,
						path: [...ctx.path, key, ...e.path],
					})));
				}
			}
		}

		return result;
	}

	protected _clone(): RecordSchema<K, V> {
		const cloned = new RecordSchema(this.keySchema, this.valueSchema);
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
			type: "object",
			additionalProperties: this.valueSchema.toJSON(),
			...(this._description && { description: this._description }),
		};
	}
}
