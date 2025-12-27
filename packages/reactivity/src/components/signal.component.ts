import type { Signal, SignalOptions } from "../types";

/**
 * Pure component for creating a signal
 * Handles the core reactive primitive logic
 */
export function createSignalComponent<T>(
	value: T,
	options?: SignalOptions<T>,
): Signal<T> {
	const subscribers = new Set<() => void>();

	const getter = (): T => {
		return value;
	};

	const setter = (newValue: T): T => {
		if (!options?.equals || !options.equals(value, newValue)) {
			value = newValue;
			subscribers.forEach(sub => {
				sub();
			});
		}
		return value;
	};

	// Expose subscribers for internal use
	(getter as any).__subscribers = subscribers;

	return [getter, setter];
}

/**
 * Get subscribers from a signal getter
 */
export function getSignalSubscribers<T>(getter: () => T): Set<() => void> {
	return (getter as any).__subscribers || new Set();
}

/**
 * Add subscriber to a signal
 */
export function addSignalSubscriber<T>(getter: () => T, subscriber: () => void): void {
	const subscribers = getSignalSubscribers(getter);
	subscribers.add(subscriber);
}
