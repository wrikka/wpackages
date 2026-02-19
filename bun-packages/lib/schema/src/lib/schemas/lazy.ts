import type { ParseContext, SafeParseResult } from "../../types";
import { Schema } from "../base";

/**
 * Lazy schema - for recursive/self-referential types
 */
export class LazySchema<T> extends Schema<T> {
	private _schema?: Schema<T>;

	constructor(private getter: () => Schema<T>) {
		super();
	}

	private get schema(): Schema<T> {
		if (!this._schema) {
			this._schema = this.getter();
		}
		return this._schema;
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const result = this.schema.safeParse(value);
		if (!result.success) {
			ctx.issues.push(...result.errors);
			return value;
		}
		return result.data;
	}

	parse(value: unknown): T {
		return this.schema.parse(value);
	}

	safeParse(value: unknown): SafeParseResult<T> {
		return this.schema.safeParse(value);
	}

	protected _clone(): LazySchema<T> {
		const cloned = new LazySchema(this.getter);
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
		return this.schema.toJSON();
	}
}
