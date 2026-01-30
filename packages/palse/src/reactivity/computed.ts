import { effect } from "../services/effect";
import type { Computed, ComputedRef, WritableComputedRef } from "../types/index";
import { signal } from "./signal";

type WritableComputedOptions<T> = {
	get: () => T;
	set: (value: T) => void;
};

export function computed<T>(getter: () => T): ComputedRef<T>;
export function computed<T>(
	options: WritableComputedOptions<T>,
): WritableComputedRef<T>;
export function computed<T>(
	getterOrOptions: (() => T) | WritableComputedOptions<T>,
): ComputedRef<T> | WritableComputedRef<T> {
	const compute = typeof getterOrOptions === "function"
		? getterOrOptions
		: getterOrOptions.get;

	let value: T;
	let dirty = true;
	const state = signal<void>(undefined); // Signal for dependency tracking

	effect(() => {
		// Run compute to establish dependency tracking
		compute();
		// When a dependency changes, mark as dirty and trigger dependents
		dirty = true;
		state.set(undefined); // Trigger effects that depend on this computed
		return undefined;
	});

	const get = () => {
		// Read from the state signal to establish dependency
		state.get();
		if (dirty) {
			value = compute();
			dirty = false;
		}
		return value;
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
			set: (newValue: T) => {
				getterOrOptions.set(newValue);
			},
		});
	}

	return out;
}
