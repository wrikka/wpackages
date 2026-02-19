import { createDepSystem } from "../services/dep-system";
import { __internal } from "../services/effect";

const { track, trigger } = createDepSystem();
const reactiveCache = new WeakMap<object, unknown>();

const trackWithEffect = (target: object, key: PropertyKey) => {
	track(target, key, __internal.getCurrentSubscriber, __internal.registerUnsubscriber);
};

const triggerWithQueue = (target: object, key: PropertyKey) => {
	trigger(target, key, __internal.queueEffect);
};

/**
 * Creates a deeply reactive proxy of an object.
 * Changes to the object or nested objects trigger effects.
 *
 * @param target - The object to make reactive
 * @returns A reactive proxy of the object
 *
 * @example
 * ```ts
 * const state = reactive({ count: 0, user: { name: "John" } });
 * effect(() => console.log(state.count));
 * state.count++; // Triggers effect
 * state.user.name = "Jane"; // Also triggers effect (deep)
 * ```
 */
export const reactive = <T extends object>(target: T): T => {
	const cached = reactiveCache.get(target) as T | undefined;
	if (cached) return cached;

	const proxy = new Proxy(target, {
		get(t, key, receiver) {
			trackWithEffect(t, key);
			const res = Reflect.get(t, key, receiver);
			if (typeof res === "object" && res !== null) {
				return reactive(res as object);
			}
			return res;
		},
		set(t, key, value, receiver) {
			const prev = Reflect.get(t, key, receiver);
			const ok = Reflect.set(t, key, value, receiver);
			if (ok && !Object.is(prev, value)) {
				triggerWithQueue(t, key);
			}
			return ok;
		},
		deleteProperty(t, key) {
			const had = Reflect.has(t, key);
			const ok = Reflect.deleteProperty(t, key);
			if (ok && had) {
				triggerWithQueue(t, key);
			}
			return ok;
		},
	});

	reactiveCache.set(target, proxy);
	return proxy;
};
