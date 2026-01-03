import { ERROR_MESSAGES } from "../../../constant";
import { createSchema, Result } from "../../../lib";
import type { Schema } from "../../../types";
import { createError } from "../../common";

const TRUTHY_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSY_VALUES = new Set(["false", "0", "no", "off"]);

export const coerceBoolean = (
	options: {
		readonly trueValues?: (string | number)[];
		readonly falseValues?: (string | number)[];
	} = {},
): Schema<unknown, boolean> => {
	const trueSet = new Set(options.trueValues || TRUTHY_VALUES);
	const falseSet = new Set(options.falseValues || FALSY_VALUES);

	return createSchema({
		parse: (input: unknown) => {
			if (typeof input === "boolean") {
				return Result.ok(input);
			}

			const lowercaseInput = typeof input === "string" ? input.toLowerCase() : input;

			if (trueSet.has(lowercaseInput as string | number)) {
				return Result.ok(true);
			}

			if (falseSet.has(lowercaseInput as string | number)) {
				return Result.ok(false);
			}

			return Result.err([
				{ ...createError(ERROR_MESSAGES.EXPECTED_BOOLEAN), path: [] },
			]);
		},
		_metadata: { name: "boolean" },
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_output: undefined as any,
	});
};
