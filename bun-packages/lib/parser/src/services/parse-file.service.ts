/**
 * Parse file using OXC parser with file system integration
 */

import type { ParseOptions, ParseResult } from "../types";
import { Result } from "../utils";
import { parseSource } from "./parse-source.service";

export const parseFile = async (
	filePath: string,
	options: ParseOptions = {},
): Promise<Result.Result<ParseResult, string>> => {
	try {
		const source = await Bun.file(filePath).text();
		const filename = filePath.split("/").pop() || filePath;

		const isTypeScript = filename.endsWith(".ts") || filename.endsWith(".tsx");
		const isJsx = filename.endsWith(".tsx") || filename.endsWith(".jsx");

		return parseSource(source, filename, {
			...options,
			typescript: isTypeScript,
			jsx: isJsx,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to read file";
		return Result.err(message);
	}
};

export const parseMultipleFiles = async (
	filePaths: readonly string[],
	options: ParseOptions = {},
): Promise<readonly Result.Result<ParseResult, string>[]> => {
	return Promise.all(filePaths.map((path) => parseFile(path, options)));
};
