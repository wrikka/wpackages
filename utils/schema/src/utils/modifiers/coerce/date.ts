import { ERROR_MESSAGES } from "../../../constant";
import { createSchema, Result } from "../../../lib";
import type { Schema } from "../../../types";
import { createError } from "../../common";

export const coerceDate = (
	options: { readonly allowInvalid?: boolean } = {},
): Schema<string | number | Date, Date> => {
	return createSchema({
		parse: (input: unknown) => {
			if (input instanceof Date) {
				return Result.ok(new Date(input.getTime()));
			}

			if (typeof input === "string" || typeof input === "number") {
				const date = new Date(input);

				if (Number.isNaN(date.getTime()) && !options.allowInvalid) {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_DATE), path: [] },
					]);
				}

				return Result.ok(date);
			}

			return Result.err([
				{ ...createError(ERROR_MESSAGES.EXPECTED_DATE), path: [] },
			]);
		},
		_metadata: { name: "date" },
		_input: undefined as unknown as string | number | Date,
		_output: undefined as unknown as Date,
	});
};
