import { track, trigger } from "../services/reactive.service";
import type { Signal, SignalOptions } from "../types";

export function createSignal<T>(
	initialValue: T,
	options?: SignalOptions<T>,
): Signal<T> {
	const signal = {
		value: initialValue,
	};

	const getter = (): T => {
		track(signal, "value");
		return signal.value;
	};

	const setter = (newValue: T | ((prev: T) => T)): T => {
		const resolvedValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(signal.value) : newValue;
		if (!options?.equals || !options.equals(signal.value, resolvedValue)) {
			signal.value = resolvedValue;
			trigger(signal, "value");
		}
		return signal.value;
	};

	return [getter, setter];
}
