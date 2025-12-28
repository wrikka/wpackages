import type { StringOptions, Schema, Result, Issue } from "../types";
import { createSchema } from "../utils/create-schema";

export type StringSchema = Schema<string> & {
	readonly min: (value: number) => StringSchema;
	readonly max: (value: number) => StringSchema;
	readonly pattern: (value: RegExp) => StringSchema;
	readonly message: (msg: string) => StringSchema;
	readonly name: (name: string) => StringSchema;
};

export function string(options: StringOptions = {}): StringSchema {
	const create = (next: StringOptions): StringSchema => {
		const base = createSchema({
			_metadata: { name: next.name || "string" },
			_input: "" as string,
			_output: "" as string,
			parse(input: unknown): Result<string> {
				if (typeof input !== "string") {
					return {
						success: false,
						issues: [
							{
								message:
									next.message ||
									`Expected a string, but received ${typeof input}`,
								path: [],
							},
						],
					};
				}

				const issues: Issue[] = [];

				if (next.min !== undefined && input.length < next.min) {
					issues.push({
						message: `String must contain at least ${next.min} character(s)`,
						path: [],
					});
				}

				if (next.max !== undefined && input.length > next.max) {
					issues.push({
						message: `String must contain at most ${next.max} character(s)`,
						path: [],
					});
				}

				if (next.pattern && !next.pattern.test(input)) {
					issues.push({
						message: `String must match pattern ${next.pattern}`,
						path: [],
					});
				}

				if (issues.length > 0) {
					return { success: false, issues };
				}

				return { success: true, data: input };
			},
		});

		const schema: StringSchema = {
			...base,
			min: (value) => create({ ...next, min: value }),
			max: (value) => create({ ...next, max: value }),
			pattern: (value) => create({ ...next, pattern: value }),
			message: (msg) => create({ ...next, message: msg }),
			name: (name) => create({ ...next, name }),
		};

		return schema;
	};

	return create(options);
}
