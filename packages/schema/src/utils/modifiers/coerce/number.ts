import { ERROR_MESSAGES } from "../../../constant";
import { Result } from "../../../lib";
import type { Schema } from "../../../types";
import { createError } from "../../../utils";

export const coerceNumber = <Output>(
	schema: Schema<number, Output>,
	options: {
		readonly strict?: boolean;
		readonly radix?: number;
		readonly allowNaN?: boolean;
	} = {},
): Schema<string | number, Output> => {
	return {
		parse: (input: unknown) => {
			if (typeof input === "number") {
				if (Number.isNaN(input) && !options.allowNaN) {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}
				return schema.parse(input);
			}

			if (typeof input === "string") {
				const num = options.radix
					? Number.parseInt(input, options.radix)
					: Number.parseFloat(input);

				if (Number.isNaN(num) && !options.allowNaN) {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}

				if (options.strict && String(num) !== input) {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}

				return schema.parse(num);
			}

			return Result.err([
				{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
			]);
		},
		_metadata: schema._metadata,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		_output: schema._output,
	};
};
