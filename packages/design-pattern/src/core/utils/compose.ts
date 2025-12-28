/**
 * Utility functions for composing patterns
 */

export const pipe = <T>(...fns: ReadonlyArray<(value: T) => T>) => (value: T): T =>
	fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: ReadonlyArray<(value: T) => T>) => (value: T): T =>
	fns.reduceRight((acc, fn) => fn(acc), value);

export const curry2 = <T1, T2, R>(fn: (a: T1, b: T2) => R) => (a: T1) => (b: T2): R => fn(a, b);

export const curry3 = <T1, T2, T3, R>(fn: (a: T1, b: T2, c: T3) => R) => (a: T1) => (b: T2) => (c: T3): R =>
	fn(a, b, c);
