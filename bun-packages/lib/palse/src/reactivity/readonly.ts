import { createDepSystem } from "../services/dep-system";
import { __internal } from "../services/effect";

const { track } = createDepSystem();
const readonlyCache = new WeakMap<object, unknown>();

const trackWithEffect = (target: object, key: PropertyKey) => {
	track(target, key, __internal.getCurrentSubscriber, __internal.registerUnsubscriber);
};

/**
 * Creates a read-only reactive proxy of an object.
 * The object can be read (triggering effects) but cannot be modified.
 * Throws TypeError on any set or delete operations.
 *
 * @param target - The object to make readonly
 * @returns A readonly reactive proxy
 *
 * @example
 * ```ts
 * const state = readonly({ count: 0 });
 * effect(() => console.log(state.count)); // Can read
 * state.count = 1; // Throws TypeError
 * ```
 */
export const readonly = <T extends object>(target: T): T => {
	const cached = readonlyCache.get(target) as T | undefined;
	if (cached) return cached;

	const proxy = new Proxy(target, {
		get(t, key, receiver) {
			trackWithEffect(t, key);
			const res = Reflect.get(t, key, receiver);
			if (typeof res === "object" && res !== null) {
				return readonly(res as object);
			}
			return res;
		},
		set(_t, _key, _value, _receiver) {
			throw new TypeError("Cannot set on readonly reactive object");
		},
		deleteProperty(_t, _key) {
			throw new TypeError("Cannot delete on readonly reactive object");
		},
	});

	readonlyCache.set(target, proxy);
	return proxy;
};
