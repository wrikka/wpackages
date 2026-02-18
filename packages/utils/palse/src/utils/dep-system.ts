import type { Subscriber, Unsubscriber } from "../types/index";

/** Internal dependency tracking system */
export type DepMap = Map<PropertyKey, Set<Subscriber>>;

export const createDepSystem = () => {
	const targetMap = new WeakMap<object, DepMap>();

	const track = (
		target: object,
		key: PropertyKey,
		getCurrentSubscriber: () => Subscriber | null,
		registerUnsubscriber: (unsub: Unsubscriber) => void,
	): void => {
		const sub = getCurrentSubscriber();
		if (!sub) return;

		let depsMap = targetMap.get(target);
		if (!depsMap) {
			depsMap = new Map();
			targetMap.set(target, depsMap);
		}

		let deps = depsMap.get(key);
		if (!deps) {
			deps = new Set();
			depsMap.set(key, deps);
		}

		deps.add(sub);
		registerUnsubscriber(() => {
			deps.delete(sub);
		});
	};

	const trigger = (target: object, key: PropertyKey, queueEffect: (effect: () => void) => void): void => {
		const depsMap = targetMap.get(target);
		const deps = depsMap?.get(key);
		if (!deps) return;
		for (const sub of Array.from(deps)) {
			queueEffect(sub);
		}
	};

	return { track, trigger, targetMap };
};

export type DepSystem = ReturnType<typeof createDepSystem>;
