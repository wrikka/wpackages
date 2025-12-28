import type { NumberOptions, Schema, Result, Issue } from "../types";
import { createSchema } from "../utils/create-schema";

export function number(options: NumberOptions = {}): Schema<number> {
	return createSchema({
		_metadata: { name: options.name || "number" },
		_input: 0 as number,
		_output: 0 as number,
		parse(input: unknown): Result<number> {
			if (typeof input !== "number") {
				return {
					success: false,
					issues: [
						{
							message:
								options.message ||
								`Expected a number, but received ${typeof input}`,
							path: [],
						},
					],
				};
			}

			const issues: Issue[] = [];

			if (options.min !== undefined && input < options.min) {
				issues.push({
					message: `Number must be greater than or equal to ${options.min}`,
					path: [],
				});
			}

			if (options.max !== undefined && input > options.max) {
				issues.push({
					message: `Number must be less than or equal to ${options.max}`,
					path: [],
				});
			}

			if (options.integer && !Number.isInteger(input)) {
				issues.push({
					message: "Number must be an integer",
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
