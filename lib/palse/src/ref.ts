
import { signal } from "./signal";
import type { Ref } from "./types";

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

