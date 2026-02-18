import type { ParseContext } from "../../types";
import { EMAIL_REGEX, URL_REGEX, UUID_REGEX } from "../../utils";
import { Schema } from "../base";

/**
 * String schema with fluent API
 */
export class StringSchema extends Schema<string> {
	private _email = false;
	private _url = false;
	private _uuid = false;
	private _regex?: RegExp;
	private _min?: number;
	private _max?: number;
	private _length?: number;
	private _trim = false;
	private _lowercase = false;
	private _uppercase = false;

	protected _validate(value: unknown, ctx: ParseContext): unknown {
		if (typeof value !== "string") {
			ctx.addIssue({
				code: "invalid_type",
				message: `Expected string, received ${typeof value}`,
				value,
			});
			return value;
		}

		let processed = value;

		// Transformations
		if (this._trim) processed = processed.trim();
		if (this._lowercase) processed = processed.toLowerCase();
		if (this._uppercase) processed = processed.toUpperCase();

		// Validations
		if ((this._min !== undefined) && (processed.length < this._min)) {
			ctx.addIssue({
				code: "too_small",
				message: `String must contain at least ${this._min} character(s)`,
				value: processed,
			});
		}

		if ((this._max !== undefined) && (processed.length > this._max)) {
			ctx.addIssue({
				code: "too_big",
				message: `String must contain at most ${this._max} character(s)`,
				value: processed,
			});
		}

		if ((this._length !== undefined) && (processed.length !== this._length)) {
			ctx.addIssue({
				code: "invalid_length",
				message: `String must contain exactly ${this._length} character(s)`,
				value: processed,
			});
		}

		if (this._email && !EMAIL_REGEX.test(processed)) {
			ctx.addIssue({
				code: "invalid_email",
				message: "Invalid email",
				value: processed,
			});
		}

		if (this._url && !URL_REGEX.test(processed)) {
			ctx.addIssue({
				code: "invalid_url",
				message: "Invalid URL",
				value: processed,
			});
		}

		if (this._uuid && !UUID_REGEX.test(processed)) {
			ctx.addIssue({
				code: "invalid_uuid",
				message: "Invalid UUID",
				value: processed,
			});
		}

		if (this._regex && !this._regex.test(processed)) {
			ctx.addIssue({
				code: "invalid_format",
				message: `Invalid format (must match ${this._regex.source})`,
				value: processed,
			});
		}

		return processed;
	}

	// Validators
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

	email(): this {
		const cloned = this._clone();
		cloned._email = true;
		return cloned;
	}

	url(): this {
		const cloned = this._clone();
		cloned._url = true;
		return cloned;
	}

	uuid(): this {
		const cloned = this._clone();
		cloned._uuid = true;
		return cloned;
	}

	regex(pattern: RegExp): this {
		const cloned = this._clone();
		cloned._regex = pattern;
		return cloned;
	}

	// Transformations
	trim(): this {
		const cloned = this._clone();
		cloned._trim = true;
		return cloned;
	}

	lowercase(): this {
		const cloned = this._clone();
		cloned._lowercase = true;
		return cloned;
	}

	uppercase(): this {
		const cloned = this._clone();
		cloned._uppercase = true;
		return cloned;
	}

	protected _clone(): StringSchema {
		const cloned = new StringSchema();
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
		cloned._email = this._email;
		cloned._url = this._url;
		cloned._uuid = this._uuid;
		cloned._regex = this._regex;
		cloned._trim = this._trim;
		cloned._lowercase = this._lowercase;
		cloned._uppercase = this._uppercase;
		return cloned;
	}

	toJSON(): Record<string, unknown> {
		const json: Record<string, unknown> = { type: "string" };
		if (this._min !== undefined) json.minLength = this._min;
		if (this._max !== undefined) json.maxLength = this._max;
		if (this._length !== undefined) json.minLength = json.maxLength = this._length;
		if (this._email) json.format = "email";
		if (this._url) json.format = "uri";
		if (this._uuid) json.pattern = "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
		if (this._regex) json.pattern = this._regex.source;
		if (this._description) json.description = this._description;
		return json;
	}
}
