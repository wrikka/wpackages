import type { ArrayOptions, Schema, Result, Issue, Infer } from "../types";
import { createSchema } from "../utils/create-schema";

export function array<TItem extends Schema<unknown, unknown>>(
	options: ArrayOptions<TItem>,
): Schema<unknown[], Infer<TItem>[]> {
	return createSchema({
		_metadata: { name: options.name || "array" },
		_input: [] as unknown[],
		_output: [] as Infer<TItem>[],
		parse(input: unknown): Result<Infer<TItem>[]> {
			if (!Array.isArray(input)) {
				return {
					success: false,
					issues: [
						{
							message:
								options.message ||
								`Expected an array, but received ${typeof input}`,
							path: [],
						},
					],
				};
			}

			const issues: Issue[] = [];
			const output: Infer<TItem>[] = [];

			for (let i = 0; i < input.length; i++) {
				const item = input[i];
				const result = options.item.parse(item);

				if (result.success) {
					output.push(result.data as Infer<TItem>);
				} else {
					issues.push(
						...result.issues.map((issue) => ({
							...issue,
							path: [i, ...issue.path],
						})),
					);
				}
			}

			if (issues.length > 0) {
				return { success: false, issues };
			}

			return { success: true, data: output };
		},
	});
}
