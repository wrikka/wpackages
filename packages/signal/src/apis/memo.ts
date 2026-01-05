import { createEffect } from "../services/effect.scope";
import type { MemoOptions } from "../types";
import { createSignal } from "./signal";

export function createMemo<T>(
	fn: () => T,
	options?: MemoOptions<T>,
): () => T {
	const [value, setValue] = createSignal<T>(undefined as T, options);

	createEffect(() => {
		setValue(fn());
	});

	return value;
}
