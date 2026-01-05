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

	const setter = (newValue: T): T => {
		if (!options?.equals || !options.equals(signal.value, newValue)) {
			signal.value = newValue;
			trigger(signal, "value");
		}
		return newValue;
	};

	return [getter, setter];
}
