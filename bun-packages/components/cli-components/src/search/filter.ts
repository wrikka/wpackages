import { fuzzyMatch as fuzzyMatchFn } from "../utils/fuzzy.utils";
import type { SearchOption } from "./types";

export function updateFiltered<T>(
	query: string,
	options: readonly SearchOption<T>[],
	maxItems: number,
): readonly SearchOption<T>[] {
	if (!query) {
		return options.slice(0, maxItems);
	}

	const scored = options
		.map((opt) => ({
			option: opt,
			score: fuzzyMatchFn(query, opt.label),
		}))
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxItems);

	return scored.map((item) => item.option);
}
