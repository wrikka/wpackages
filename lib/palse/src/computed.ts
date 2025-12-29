import type { Computed, ComputedRef, WritableComputedRef } from "./types";
import { effect } from "./effect";
import { signal } from "./signal";

type WritableComputedOptions<T> = {
	get: () => T;
	set: (value: T) => void;
};

export function computed<T>(getter: () => T): ComputedRef<T>;
export function computed<T>(options: WritableComputedOptions<T>): WritableComputedRef<T>;
export function computed<T>(
	getterOrOptions: (() => T) | WritableComputedOptions<T>,
): ComputedRef<T> | WritableComputedRef<T> {
	const compute =
		typeof getterOrOptions === "function"
			? getterOrOptions
			: getterOrOptions.get;

	const state = signal<T>(undefined as unknown as T);
	let initialized = false;

	effect(() => {
		const next = compute();
		if (!initialized) initialized = true;
		state.set(next);
		return undefined;
	});

	const get = () => {
		if (!initialized) {
			state.set(compute());
			initialized = true;
		}
		return state.get();
	};

	const out: Computed<T> & {
		value: T;
	} = {
		get,
		get value() {
			return get();
		},
	};

	if (typeof getterOrOptions !== "function") {
		Object.defineProperty(out, "value", {
			enumerable: true,
			get: () => get(),
			set: (value: T) => {
				getterOrOptions.set(value);
			},
		});
	}

	return out;
}
