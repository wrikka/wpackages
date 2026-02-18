import type { Ref } from "../types/index";
import { signal } from "./signal";

/**
 * Creates a reactive reference with a `.value` property.
 * This is a convenience wrapper around signal for object-like access.
 *
 * @param value - The initial value
 * @returns A reactive reference with `.value` getter/setter
 *
 * @example
 * ```ts
 * const count = ref(0);
 * effect(() => console.log(count.value)); // Logs: 0
 * count.value = 5; // Logs: 5
 * ```
 */
export const ref = <T>(value: T): Ref<T> => {
	const s = signal(value);
	return {
		get value() {
			return s.get();
		},
		set value(next: T) {
			s.set(next);
		},
	};
};
