import { createSchema } from "../lib/create-schema";
import type { Infer, Issue, ObjectOptions, Result, Schema } from "./index";

type ObjectOutput<TShape extends Record<string, Schema<unknown, unknown>>> = {
	[K in keyof TShape]: Infer<TShape[K]>;
};

export function object<TShape extends Record<string, Schema<unknown, unknown>>>(
	options: ObjectOptions<TShape>,
): Schema<Record<string, unknown>, ObjectOutput<TShape>> {
	return createSchema({
		_metadata: { name: options.name || "object" },
		_input: {} as Record<string, unknown>,
		_output: {} as ObjectOutput<TShape>,
		shape: options.shape,
		parse(input: unknown): Result<ObjectOutput<TShape>> {
			if (typeof input !== "object" || input === null) {
				return {
					success: false,
					issues: [
						{
							message: options.message
								|| `Expected an object, but received ${typeof input}`,
							path: [],
						},
					],
				};
			}

			const issues: Issue[] = [];
			const output: Record<string, unknown> = {};
			const record = input as Record<string, unknown>;

			for (const key in options.shape) {
				if (Object.hasOwn(options.shape, key)) {
					const schema = options.shape[key];
					if (schema) {
						const value = record[key];
						const result = schema.parse(value);

						if (result.success) {
							output[key] = result.data;
						} else {
							issues.push(
								...result.issues.map((issue) => ({
									...issue,
									path: [key, ...issue.path],
								})),
							);
						}
					}
				}
			}

			if (issues.length > 0) {
				return { success: false, issues };
			}

			return { success: true, data: output as ObjectOutput<TShape> };
		},
	});
}
