import type { Computed, Ref } from "../types";

// Type guards
export function isRef<T>(value: unknown): value is Ref<T> {
	return typeof value === "function" && value.length <= 1;
}

export function isComputed<T>(value: unknown): value is Computed<T> {
	return typeof value === "function" && value.length === 0;
}

export function isReactive<T>(value: unknown): value is Ref<T> | Computed<T> {
	return isRef(value) || isComputed(value);
}
