import type { SearchOption } from "./types";

export interface SearchState<T> {
	query: string;
	selectedIndex: number;
	filtered: readonly SearchOption<T>[];
	isFirstRender: boolean;
}

export function createInitialState<T>(
	options: readonly SearchOption<T>[],
	maxItems: number,
): SearchState<T> {
	return {
		query: "",
		selectedIndex: 0,
		filtered: options.slice(0, maxItems),
		isFirstRender: true,
	};
}
