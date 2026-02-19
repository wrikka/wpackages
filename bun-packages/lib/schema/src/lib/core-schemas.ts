import { MinimalSchema, TypeError } from "./minimal-base";

/**
 * Ultra-light string schema
 */
export class StringSchema extends MinimalSchema<string> {
	constructor() {
		super();
	}

	protected _validate(value: unknown): string {
		if (typeof value !== "string") {
			throw new TypeError("string", typeof value);
		}
		return value;
	}

	toJSON(): Record<string, unknown> {
		return { type: "string" };
	}
}

/**
 * Ultra-light number schema
 */
export class NumberSchema extends MinimalSchema<number> {
	constructor() {
		super();
	}

	protected _validate(value: unknown): number {
		if (typeof value !== "number") {
			throw new TypeError("number", typeof value);
		}
		return value;
	}

	toJSON(): Record<string, unknown> {
		return { type: "number" };
	}
}

/**
 * Ultra-light boolean schema
 */
export class BooleanSchema extends MinimalSchema<boolean> {
	constructor() {
		super();
	}

	protected _validate(value: unknown): boolean {
		if (typeof value !== "boolean") {
			throw new TypeError("boolean", typeof value);
		}
		return value;
	}

	toJSON(): Record<string, unknown> {
		return { type: "boolean" };
	}
}

/**
 * Ultra-light unknown schema
 */
export class UnknownSchema extends MinimalSchema<unknown> {
	constructor() {
		super();
	}

	protected _validate(value: unknown): unknown {
		return value;
	}

	toJSON(): Record<string, unknown> {
		return { type: "unknown" };
	}
}
