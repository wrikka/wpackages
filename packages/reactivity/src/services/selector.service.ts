import type { Accessor } from "../types";
import { createMemo } from "../utils/signal.util";

/**
 * Creates a reactive selector that efficiently determines if a key is 'selected'.
 * Useful for large lists where only one item can be selected at a time.
 */
export function createSelector<T>(source: Accessor<T>): (key: T) => boolean {
	return (key: T) => {
		// This creates a memoized computation for each key.
		// It only re-runs if the source signal changes TO or FROM this specific key.
		return createMemo(() => source() === key)();
	};
}
