import { ERROR_MESSAGES } from "../../../constant";
import { createSchema, Result } from "../../../lib";
import type { Schema } from "../../../types";
import { createError } from "../..";

export const coerceString = (
	options: {
		readonly trim?: boolean;
		readonly toLowerCase?: boolean;
		readonly toUpperCase?: boolean;
	} = {},
): Schema<unknown, string> => {
	return createSchema({
		parse: (input: unknown) => {
			if (typeof input === "string") {
				let value = input;
				if (options.trim) {
					value = value.trim();
				}
				if (options.toLowerCase) {
					value = value.toLowerCase();
				}
				if (options.toUpperCase) {
					value = value.toUpperCase();
				}
				return Result.ok(value);
			}

			if (input === null || input === undefined) {
				return Result.err([
					{ ...createError(ERROR_MESSAGES.EXPECTED_STRING), path: [] },
				]);
			}

			let value: string;
			try {
				value = JSON.stringify(input) ?? Object.prototype.toString.call(input);
			} catch {
				value = Object.prototype.toString.call(input);
			}
			return Result.ok(value);
		},
		_metadata: { name: "string" },
		_input: undefined as unknown,
		_output: undefined as unknown as string,
	});
};
