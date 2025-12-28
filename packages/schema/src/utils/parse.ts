import { parse as parseWithParser } from "parser";
import type { Schema, Result } from "../types";

export async function parse<T>(
	schema: Schema<unknown, T>,
	source: string,
	filename: string,
): Promise<Result<T>> {
	const parseResult = await parseWithParser(source, filename);

	if (parseResult.ok === false) {
		return {
			success: false,
			issues: [{ message: parseResult.error, path: [] }],
		};
	}

	return schema.parse(parseResult.value.data);
}
