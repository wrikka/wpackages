import type { Schema, Result, Issue, Infer } from "../types";
import { createSchema } from "../utils/create-schema";

type UnionOptions<
	T extends readonly [Schema<any, any>, ...Schema<any, any>[]],
> = {
	options: T;
	message?: string;
};

type UnionOutput<T extends readonly [Schema<any, any>, ...Schema<any, any>[]]> =
	Infer<T[number]>;

export function union<
	T extends readonly [Schema<any, any>, ...Schema<any, any>[]],
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
					return result;
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
