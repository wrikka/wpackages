import { __internal } from "../services/effect";

type Subscriber = () => void;

const targetMap = new WeakMap<object, Map<PropertyKey, Set<Subscriber>>>();
const readonlyCache = new WeakMap<object, unknown>();

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

export const readonly = <T extends object>(target: T): T => {
	const cached = readonlyCache.get(target) as T | undefined;
	if (cached) return cached;

	const proxy = new Proxy(target, {
		get(t, key, receiver) {
			track(t, key);
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
