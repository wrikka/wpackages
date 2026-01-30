import type { None, Option, Some } from "../types";

export const some = <A>(value: A): Some<A> => ({ _tag: "Some", value });

export const none: None = Object.freeze({ _tag: "None" });

export const isSome = <A>(option: Option<A>): option is Some<A> => option._tag === "Some";

export const isNone = <A>(option: Option<A>): option is None => option._tag === "None";

export const mapOption = <A, B>(f: (a: A) => B) => (option: Option<A>): Option<B> => {
	return isSome(option) ? some(f(option.value)) : none;
};

export const flatMapOption = <A, B>(f: (a: A) => Option<B>) => (option: Option<A>): Option<B> => {
	return isSome(option) ? f(option.value) : none;
};

export const foldOption = <A, B>(onNone: () => B, onSome: (value: A) => B) => (option: Option<A>): B => {
	return isSome(option) ? onSome(option.value) : onNone();
};

export const getOrElse = <A>(defaultValue: A) => (option: Option<A>): A => {
	return isSome(option) ? option.value : defaultValue;
};

export const fromNullable = <A>(value: A | null | undefined): Option<A> => {
	return value === null || value === undefined ? none : some(value);
};

export const toNullable = <A>(option: Option<A>): A | null => {
	return isSome(option) ? option.value : null;
};

export const filterOption = <A>(predicate: (a: A) => boolean) => (option: Option<A>): Option<A> => {
	return isSome(option) && predicate(option.value) ? option : none;
};

export const orElse = <A>(fallback: Option<A>) => (option: Option<A>): Option<A> => {
	return isSome(option) ? option : fallback;
};
