import type { StringOptions, Schema, Result, Issue } from "../types";
import { createSchema } from "../utils/create-schema";

export function string(options: StringOptions = {}): Schema<string> {
	return createSchema({
		_metadata: { name: options.name || "string" },
		_input: "" as string,
		_output: "" as string,
		parse(input: unknown): Result<string> {
			if (typeof input !== "string") {
				return {
					success: false,
					issues: [
						{
							message:
								options.message ||
								`Expected a string, but received ${typeof input}`,
							path: [],
						},
					],
				};
			}

			const issues: Issue[] = [];

			if (options.min !== undefined && input.length < options.min) {
				issues.push({
					message: `String must contain at least ${options.min} character(s)`,
					path: [],
				});
			}

			if (options.max !== undefined && input.length > options.max) {
				issues.push({
					message: `String must contain at most ${options.max} character(s)`,
					path: [],
				});
			}

			if (options.pattern && !options.pattern.test(input)) {
				issues.push({
					message: `String must match pattern ${options.pattern}`,
					path: [],
				});
			}

			if (issues.length > 0) {
				return { success: false, issues };
			}

			return { success: true, data: input };
		},
	});
}
