import { Effect } from "effect";
import { transformerMap } from "./constant";
import type { DocumentFormat, TransformOptions } from "./types";
import { detectFormat } from "./utils/detectFormat";

/**
 * Transform document from one format to another
 */
export const transform = (
	source: string,
	from: DocumentFormat | "auto",
	to: DocumentFormat,
	options?: TransformOptions,
	filename?: string,
): Effect.Effect<string, Error> => {
	return Effect.gen(function*() {
		const sourceFormat = from === "auto" ? detectFormat(source, filename) : from;
		const key = `${sourceFormat}->${to}`;

		const transformer = transformerMap.get(key);

		if (!transformer) {
			return yield* Effect.fail(new Error(`No transformer found for ${sourceFormat} -> ${to}`));
		}

		return transformer.transform(source, options);
	});
};
