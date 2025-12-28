import type { Schema, Result } from "../types";
import { createSchema } from "../utils/create-schema";

export function optional<TInput, TOutput>(
	schema: Schema<TInput, TOutput>,
): Schema<TInput | undefined, TOutput | undefined> {
	return createSchema({
		_metadata: { name: "optional" },
		_input: undefined as TInput | undefined,
		_output: undefined as TOutput | undefined,
		parse(input: unknown): Result<TOutput | undefined> {
			if (input === undefined) {
				return { success: true, data: undefined };
			}
			return schema.parse(input) as Result<TOutput>;
		},
	});
}
