import { ERROR_MESSAGES } from "../../../constant";
import { Result } from "../../../lib";
import type { Schema } from "../../../types";
import { createError } from "../../../utils";

export const coerceString = (
	options: {
		readonly trim?: boolean;
		readonly toLowerCase?: boolean;
		readonly toUpperCase?: boolean;
	} = {},
): Schema<unknown, string> => {
	return {
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

			return Result.ok(String(input));
		},
		_metadata: { name: "string" },
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_output: undefined as any,
	};
};
