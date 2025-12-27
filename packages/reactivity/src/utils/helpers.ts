import type { Ref } from "../types";
import { isRef } from "./validator";

// Utility functions
export function unref<T>(value: Ref<T> | T): T {
	return isRef<T>(value) ? value() : value as T;
}

export function toRaw<T>(value: T): T {
	return value;
}
