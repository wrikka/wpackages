import type { ParseContext, SafeParseResult } from '../../types';
import { Schema } from '../base';

/**
 * Pipeline schema - chain multiple schemas for transformation pipeline
 */
export class PipelineSchema<A, B> extends Schema<B> {
	constructor(
		private first: Schema<A>,
		private second: Schema<B>,
	) {
		super();
	}

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		const firstResult = this.first.safeParse(value);

		if (!firstResult.success) {
			ctx.issues.push(...firstResult.errors);
			return value;
		}

		const secondResult = this.second.safeParse(firstResult.data);

		if (!secondResult.success) {
			ctx.issues.push(...secondResult.errors);
			return value;
		}

		return secondResult.data;
	}

	parse(value: unknown): B {
		const firstResult = this.first.parse(value);
		return this.second.parse(firstResult);
	}

	safeParse(value: unknown): SafeParseResult<B> {
		const firstResult = this.first.safeParse(value);

		if (!firstResult.success) {
			return { success: false, errors: firstResult.errors };
		}

		return this.second.safeParse(firstResult.data);
	}

	pipe<C>(next: Schema<C>): PipelineSchema<B, C> {
		return new PipelineSchema(this as unknown as Schema<B>, next);
	}

	protected _clone(): PipelineSchema<A, B> {
		const cloned = new PipelineSchema(this.first, this.second);
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
		return this.second.toJSON();
	}
}
