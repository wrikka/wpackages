import { createSchema } from "../lib/create-schema";
import type { Infer, Issue, Result, Schema } from "./index";

type UnionOptions<
	T extends readonly [Schema<unknown, unknown>, ...Schema<unknown, unknown>[]],
> = {
	options: T;
	message?: string;
};

type UnionOutput<
	T extends readonly [Schema<unknown, unknown>, ...Schema<unknown, unknown>[]],
> = Infer<T[number]>;

export function union<
	T extends readonly [Schema<unknown, unknown>, ...Schema<unknown, unknown>[]],
>(options: UnionOptions<T>): Schema<unknown, UnionOutput<T>> {
	return createSchema({
		_metadata: { name: "union" },
		_input: {} as unknown,
		_output: {} as UnionOutput<T>,
		parse(input: unknown): Result<UnionOutput<T>> {
			const issues: Issue[] = [];
			for (const schema of options.options) {
				const result = schema.parse(input);
				if (result.success) {
					return result as Result<UnionOutput<T>>;
				}
				issues.push(...result.issues);
			}
			return {
				success: false,
				issues: options.message
					? [{ message: options.message, path: [] }]
					: issues,
			};
		},
	});
}
