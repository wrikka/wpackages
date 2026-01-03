import { createSchema } from "../lib/create-schema";
import type { Result, Schema } from "./index";

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
