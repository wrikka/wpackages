/**
 * Parse source code using OXC parser
 */

import { parseSync } from "oxc-parser";
import type { ParseOptions, ParseResult } from "../types";
import { Result } from "../utils";

export const parseSource = (
	source: string,
	filename: string,
	options: ParseOptions = {},
): Result.Result<ParseResult, string> => {
	const { sourceType = "module" } = options;

	try {
		const result = parseSync(filename, source, { ...options });

		const errors = result.errors?.map((err: unknown) => {
			const error = err as { message?: string; line?: number; column?: number };
			return {
				message: typeof err === "string" ? err : error.message || "Parse error",
				line: error.line || 0,
				column: error.column || 0,
			};
		}) || [];

		const parseResult: ParseResult = {
			ast: result.program,
			errors,
			sourceType,
		};

		return Result.ok(parseResult);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown parse error";
		return Result.err(message);
	}
};
