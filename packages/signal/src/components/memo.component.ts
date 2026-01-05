import type { SignalOptions } from "../types";

/**
 * Pure component for creating a memoized computation
 * Handles derived signal logic
 */
export function createMemoComponent<T>(
	fn: () => T,
	_options?: SignalOptions<T>,
): {
	getValue: () => T;
	markDirty: () => void;
	isDirty: () => boolean;
} {
	let value: T = fn();
	let dirty = true;

	return {
		getValue: () => {
			if (dirty) {
				value = fn();
				dirty = false;
			}
			return value;
		},
		markDirty: () => {
			dirty = true;
		},
		isDirty: () => dirty,
	};
}
