/** @deprecated */
export interface Ref<T> {
	(): T;
	(v: T): T;
	// [Symbol.observable]: () => Ref<T>;
}

export type Accessor<T> = () => T;
export type Setter<T> = (v: T | ((prev: T) => T)) => T;
export type Signal<T> = [Accessor<T>, Setter<T>];

export interface SignalOptions<T> {
	equals?: false | ((prev: T, next: T) => boolean);
}
