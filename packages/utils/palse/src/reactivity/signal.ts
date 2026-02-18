import { __internal, queueEffect } from "../services/effect";
import type { Signal } from "../types/index";

type Subscriber = () => void;

/**
 * Creates a reactive signal with getter and setter.
 * Signals are the fundamental reactive primitive - changes trigger effects.
 *
 * @param initial - The initial value of the signal
 * @returns A signal object with get() and set() methods
 *
 * @example
 * ```ts
 * const count = signal(0);
 * effect(() => console.log(count.get())); // Logs: 0
 * count.set(5); // Logs: 5
 * count.set(v => v + 1); // Logs: 6 (functional update)
 * ```
 */
export const signal = <T>(initial: T): Signal<T> => {
	let value = initial;
	const subscribers = new Set<Subscriber>();

	const get = () => {
		const sub = __internal.getCurrentSubscriber();
		if (sub) {
			subscribers.add(sub);
			// Create stable reference for this subscription
			const unsub = () => subscribers.delete(sub);
			__internal.registerUnsubscriber(unsub);
		}
		return value;
	};

	const set: Signal<T>["set"] = (next) => {
		const nextValue = typeof next === "function" ? (next as (prev: T) => T)(value) : next;

		if (Object.is(nextValue, value)) return;
		value = nextValue;
		for (const sub of Array.from(subscribers)) {
			queueEffect(sub);
		}
	};

	return { get, set };
};
