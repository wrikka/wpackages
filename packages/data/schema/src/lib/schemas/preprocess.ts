import type { ParseContext, SafeParseResult } from '../../types';
import { Schema } from '../base';

/**
 * Preprocess schema - transform input before validation
 */
export class PreprocessSchema<T> extends Schema<T> {
	constructor(
		private preprocessor: (value: unknown) => unknown,
		private schema: Schema<T>,
	) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const preprocessed = this.preprocessor(value);
		const result = this.schema.safeParse(preprocessed);

		if (!result.success) {
			ctx.issues.push(...result.errors);
			return value;
		}

		return result.data;
	}

	parse(value: unknown): T {
		const preprocessed = this.preprocessor(value);
		return this.schema.parse(preprocessed);
	}

	safeParse(value: unknown): SafeParseResult<T> {
		const preprocessed = this.preprocessor(value);
		return this.schema.safeParse(preprocessed);
	}

	protected _clone(): PreprocessSchema<T> {
		const cloned = new PreprocessSchema(this.preprocessor, this.schema);
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
