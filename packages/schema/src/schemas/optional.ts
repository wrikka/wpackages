import type { Schema, Result, Infer } from "../types";
import { createSchema } from "../utils/create-schema";

export function optional<T extends Schema<any, any>>(
	schema: T,
): Schema<Infer<T> | undefined, Infer<T> | undefined> {
	return createSchema({
		_metadata: { name: "optional" },
		_input: undefined as Infer<T> | undefined,
		_output: undefined as Infer<T> | undefined,
		parse(input: unknown): Result<Infer<T> | undefined> {
			if (input === undefined) {
				return { success: true, data: undefined };
			}
			return schema.parse(input);
		},
	});
}
