import { parse as parseWithParser } from "parser";
import type { Schema, Result } from "../types";

export function parse<T>(
	schema: Schema<any, T>,
	source: string,
	filename: string,
): Result<T> {
	const parseResult = parseWithParser(source, filename);

	if (parseResult.success === false) {
		return {
			success: false,
			issues: [{ message: parseResult.error, path: [] }],
		};
	}

	return schema.parse(parseResult.value.data);
}
