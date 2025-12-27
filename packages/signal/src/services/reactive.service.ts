import type { Reactive } from "../types";
import { currentEffect } from "./effect.scope";

const targetMap = new WeakMap<object, Map<any, Set<() => void>>>();

export function track(target: object, key: any) {
	if (currentEffect) {
		let depsMap = targetMap.get(target);
		if (!depsMap) {
			depsMap = new Map();
			targetMap.set(target, depsMap);
		}
		let dep = depsMap.get(key);
		if (!dep) {
			dep = new Set();
			depsMap.set(key, dep);
		}
		dep.add(currentEffect);
	}
}

export function trigger(target: object, key: any) {
	const depsMap = targetMap.get(target);
	if (!depsMap) return;
	const dep = depsMap.get(key);
	if (dep) {
		dep.forEach(effect => {
			effect();
		});
	}
}

export function reactive<T extends object>(target: T): Reactive<T> {
	return new Proxy(target, {
		get(target, key, receiver) {
			const result = Reflect.get(target, key, receiver);
			track(target, key);
			// Deep reactivity for nested objects
			if (result !== null && typeof result === "object") {
				return reactive(result);
			}
			return result;
		},
		set(target, key, value, receiver) {
			const oldValue = Reflect.get(target, key, receiver);
			const result = Reflect.set(target, key, value, receiver);
			if (oldValue !== value) {
				trigger(target, key);
			}
			return result;
		},
	});
}
