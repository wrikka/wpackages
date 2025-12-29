import { __internal } from "./effect";
import type { Signal } from "./types";

type Subscriber = () => void;

export const signal = <T>(initial: T): Signal<T> => {
	let value = initial;
	const subscribers = new Set<Subscriber>();

	const get = () => {
		const sub = __internal.getCurrentSubscriber();
		if (sub) {
			subscribers.add(sub);
			__internal.registerUnsubscriber(() => {
				subscribers.delete(sub);
			});
		}
		return value;
	};

	const set: Signal<T>["set"] = (next) => {
		const nextValue =
			typeof next === "function"
				? (next as (prev: T) => T)(value)
				: next;

		if (Object.is(nextValue, value)) return;
		value = nextValue;
		for (const sub of subscribers) sub();
	};

	return { get, set };
};
