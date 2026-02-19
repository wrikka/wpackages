/**
 * Data transformation pipeline
 * Chain transformations for data processing
 */

import { FluentSchema } from "./fluent-schema";
import type { SafeParseResult } from "../types";

/**
 * Transform function type
 */
export type TransformFunction<T, U> = (value: T) => U;

/**
 * Pipeline step
 */
export interface PipelineStep<T, U> {
	transform: TransformFunction<T, U>;
	description?: string;
}

/**
 * Schema with transformation pipeline
 */
export class TransformSchema<T> extends FluentSchema<T> {
	private pipeline: PipelineStep<any, any>[] = [];

	/**
	 * Add transformation step
	 */
	transform<U>(fn: TransformFunction<T, U>, description?: string): TransformSchema<U> {
		const newSchema = new TransformSchema<U>();
		newSchema.pipeline = [...this.pipeline, { transform: fn, description }];
		newSchema._validate = this._validate.bind(this);
		return newSchema;
	}

	/**
	 * Trim strings
	 */
	trim(): TransformSchema<string> {
		return this.transform(
			(value: string) => value.trim(),
			'Trim whitespace'
		);
	}

	/**
	 * Convert to lowercase
	 */
	toLowerCase(): TransformSchema<string> {
		return this.transform(
			(value: string) => value.toLowerCase(),
			'Convert to lowercase'
		);
	}

	/**
	 * Convert to uppercase
	 */
	toUpperCase(): TransformSchema<string> {
		return this.transform(
			(value: string) => value.toUpperCase(),
			'Convert to uppercase'
		);
	}

	/**
	 * Parse numbers from strings
	 */
	toNumber(): TransformSchema<number> {
		return this.transform(
			(value: string) => {
				const num = parseFloat(value);
				if (isNaN(num)) {
					throw new Error(`Cannot convert "${value}" to number`);
				}
				return num;
			},
			'Parse number from string'
		);
	}

	/**
	 * Convert to date
	 */
	toDate(): TransformSchema<Date> {
		return this.transform(
			(value: string | number) => {
				if (typeof value === 'number') {
					return new Date(value);
				}
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					throw new Error(`Cannot convert "${value}" to date`);
				}
				return date;
			},
			'Convert to date'
		);
	}

	/**
	 * Sanitize string (remove HTML, etc.)
	 */
	sanitize(): TransformSchema<string> {
		return this.transform(
			(value: string) => {
				return value
					.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)*<\/script>/gi, '')
					.replace(/<[^>]*>/g, '')
					.trim();
			},
			'Sanitize HTML and special characters'
		);
	}

	/**
	 * Default value transformation
	 */
	default<U>(defaultValue: U): TransformSchema<T | U> {
		return this.transform(
			(value: T) => value === undefined || value === null ? defaultValue : value,
			`Default to ${JSON.stringify(defaultValue)}`
		);
	}

	/**
	 * Apply all transformations
	 */
	protected _validate(value: unknown): T {
		let result = super._validate(value);

		// Apply pipeline transformations
		for (const step of this.pipeline) {
			result = step.transform(result);
		}

		return result;
	}

	protected _clone(): TransformSchema<T> {
		const cloned = new TransformSchema<T>();
		cloned.pipeline = [...this.pipeline];
		cloned._validate = this._validate;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const baseSchema = super.toJSON();
		return {
			...baseSchema,
			pipeline: this.pipeline.map(step => step.description || 'transform')
		};
	}
}

/**
 * Built-in transforms
 */
export const transforms = {
	trim: (value: string) => value.trim(),
	toLowerCase: (value: string) => value.toLowerCase(),
	toUpperCase: (value: string) => value.toUpperCase(),
	toNumber: (value: string) => {
		const num = parseFloat(value);
		if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
		return num;
	},
	toDate: (value: string | number) => {
		const date = new Date(value);
		if (isNaN(date.getTime())) throw new Error(`Cannot convert "${value}" to date`);
		return date;
	},
	sanitize: (value: string) => value
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)*<\/script>/gi, '')
		.replace(/<[^>]*>/g, '')
		.trim(),
	default: <T, U>(defaultValue: U) => (value: T) => value === undefined || value === null ? defaultValue : value,
};
