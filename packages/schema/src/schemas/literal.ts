import type { Schema, Result } from "../types";
import { createSchema } from "../utils/create-schema";

type Literal = string | number | boolean;

type LiteralOptions<T extends readonly [Literal, ...Literal[]]> = {
	options: T;
	message?: string;
};

export function literal<T extends readonly [Literal, ...Literal[]]>(
	options: LiteralOptions<T>,
): Schema<unknown, T[number]> {
	return createSchema({
		_metadata: { name: "literal" },
		_input: {} as unknown,
		_output: {} as T[number],
		parse(input: unknown): Result<T[number]> {
			if (options.options.includes(input as Literal)) {
				return { success: true, data: input as T[number] };
			}
			return {
				success: false,
				issues: [
					{
						message:
							options.message ||
							`Expected one of ${options.options.join(", ")}, but received ${input}`,
						path: [],
					},
				],
			};
		},
	});
}
