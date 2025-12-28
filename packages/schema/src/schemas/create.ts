import type { Issue, Result, Schema, ValidationContext } from "../types";
import { createSchema as createSchemaWithTransform } from "../utils/create-schema";

export const createSchema = <TInput, TOutput>(
	parser: (
		input: TInput,
		ctx: ValidationContext & { issues: Issue[]; data?: TOutput },
	) => void,
	options?: { name?: string },
): Schema<TInput, TOutput> => {
	return createSchemaWithTransform({
		parse: (
			input: unknown,
			context?: Partial<ValidationContext>,
		): Result<TOutput> => {
			const ctx: ValidationContext & { issues: Issue[]; data?: TOutput } = {
				path: context?.path || [],
				issues: [],
			};
			parser(input as TInput, ctx);
			if (ctx.issues.length > 0) {
				return { success: false, issues: ctx.issues };
			}
			return { success: true, data: ctx.data as TOutput };
		},
		_metadata: options || {},
		_input: undefined as unknown as TInput,
		_output: undefined as unknown as TOutput,
	});
};
