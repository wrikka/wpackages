import { Effect } from "effect";
import { format as coreFormat, ProcessError } from "@wpackages/formatter";
import type { FormatOptions, FormatResult } from "../types";

export const formatService = (
	paths: readonly string[],
	options: FormatOptions,
): Effect.Effect<FormatResult, ProcessError> =>
	Effect.tryPromise({
		try: async () => {
			const result = await coreFormat(paths as string[], options);
			const filesFormatted = result.stdout.includes("files formatted")
				? Number.parseInt(result.stdout.match(/(\d+) files formatted/)![1], 10)
				: 0;
			const filesChecked = result.stdout.includes("files checked")
				? Number.parseInt(result.stdout.match(/(\d+) files checked/)![1], 10)
				: paths.length;

			return {
				stdout: result.stdout,
				stderr: result.stderr,
				filesFormatted,
				filesChecked,
			};
		},
		catch: (error) => {
			if (error instanceof ProcessError) {
				return error;
			}
			return new ProcessError(
				error instanceof Error ? error.message : String(error),
				"",
				"",
				1,
			);
		},
	});
