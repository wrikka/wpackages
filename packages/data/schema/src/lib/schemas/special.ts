import type { ParseContext } from "../../types";
import { Schema } from "../base";

/**
 * Any schema - accepts any value
 */
export class AnySchema extends Schema<unknown> {
	protected _validate(value: unknown): unknown {
		return value;
	}

	protected _clone(): AnySchema {
		const cloned = new AnySchema();
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
		return {};
	}
}

/**
 * Unknown schema - accepts unknown value
 */
export class UnknownSchema extends Schema<unknown> {
	protected _validate(value: unknown): unknown {
		return value;
	}

	protected _clone(): UnknownSchema {
		const cloned = new UnknownSchema();
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
		return {};
	}
}

/**
 * Never schema - rejects all values
 */
export class NeverSchema extends Schema<never> {
	protected _validate(value: unknown, ctx: ParseContext): unknown {
		ctx.addIssue({
			code: "never",
			message: "Value should never be provided",
			value,
		});
		return value;
	}

	protected _clone(): NeverSchema {
		const cloned = new NeverSchema();
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
		return { not: {} };
	}
}
