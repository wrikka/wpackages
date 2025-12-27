import { queueEffect } from "../services/batch.service";
import { createEffect, currentEffect } from "../services/effect.scope";

import type { Accessor, Signal, SignalOptions } from "../types";

// The new core primitive
export function createSignal<T>(value: T, options?: SignalOptions<T>): Signal<T> {
	const subscribers = new Set<() => void>();

	const getter = (): T => {
		if (currentEffect) {
			subscribers.add(currentEffect);
		}
		return value;
	};

	const setter = (newValue: T): T => {
		if (!options?.equals || !options.equals(value, newValue)) {
			value = newValue;
			subscribers.forEach(sub => {
				queueEffect(sub);
			});
		}
		return value;
	};

	return [getter, setter];
}

export function createMemo<T>(fn: () => T, options?: SignalOptions<T>): Accessor<T> {
	let value: T = fn();
	let dirty = true;

	const memoized = createSignal<T>(value, options);

	createEffect(() => {
		// This effect tracks the dependencies of `fn`
		fn();
		// When they change, we mark the memo as dirty
		dirty = true;
	});

	return () => {
		if (dirty) {
			value = fn();
			memoized[1](value);
			dirty = false;
		}
		return memoized[0]();
	};
}
