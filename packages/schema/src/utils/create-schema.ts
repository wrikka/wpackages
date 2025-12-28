import type { Schema, Result } from "../types";

type SchemaDefinition<TInput, TOutput> = Omit<
	Schema<TInput, TOutput>,
	"transform"
>;

export function createSchema<TInput, TOutput>(
	definition: SchemaDefinition<TInput, TOutput>,
): Schema<TInput, TOutput> {
	return {
		...definition,
		transform: <TNewOutput>(
			transformer: (value: TOutput) => TNewOutput,
		): Schema<TInput, TNewOutput> => {
			return createSchema({
				...definition,
				_output: {} as TNewOutput,
				parse: (input: unknown): Result<TNewOutput> => {
					const result = definition.parse(input);
					if (result.success) {
						try {
							return { success: true, data: transformer(result.data) };
						} catch (e: any) {
							return {
								success: false,
								issues: [{ message: e.message, path: [] }],
							};
						}
					}
					return result;
				},
			});
		},
	};
}
