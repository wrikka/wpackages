import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Symbol schema
 */
export class SymbolSchema extends Schema<symbol> {
	private _description?: string;

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "symbol") {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected symbol, received ${typeof value}`,
				value,
			});
			return value;
		}
		return value;
	}

	protected _clone(): SymbolSchema {
		const cloned = new SymbolSchema();
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
			type: "string",
			format: "symbol",
			...(this._description && { description: this._description }),
		};
	}
}
