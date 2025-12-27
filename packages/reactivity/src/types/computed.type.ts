/** @deprecated */
export interface Computed<T> {
	(): T;
	// [Symbol.observable]: () => Computed<T>;
}
