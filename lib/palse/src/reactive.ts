
import { __internal } from "./effect";

type Subscriber = () => void;

const targetMap = new WeakMap<object, Map<PropertyKey, Set<Subscriber>>>();
const reactiveCache = new WeakMap<object, unknown>();

const track = (target: object, key: PropertyKey) => {
	const sub = __internal.getCurrentSubscriber();
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
	__internal.registerUnsubscriber(() => {
		deps.delete(sub);
	});
};

const trigger = (target: object, key: PropertyKey) => {
	const depsMap = targetMap.get(target);
	const deps = depsMap?.get(key);
	if (!deps) return;
	for (const sub of deps) sub();
};

export const reactive = <T extends object>(target: T): T => {
	const cached = reactiveCache.get(target) as T | undefined;
	if (cached) return cached;

	const proxy = new Proxy(target, {
		get(t, key, receiver) {
			track(t, key);
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
				trigger(t, key);
			}
			return ok;
		},
		deleteProperty(t, key) {
			const had = Reflect.has(t, key);
			const ok = Reflect.deleteProperty(t, key);
			if (ok && had) {
				trigger(t, key);
			}
			return ok;
		},
	});

	reactiveCache.set(target, proxy);
	return proxy;
};

