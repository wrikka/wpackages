/**
 * Utility functions for the program framework
 *
 * This directory contains pure functions with no side effects.
 * Utilities should be composable and testable.
 */

/**
 * Pipe - Compose functions left to right
 */
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E): E;
export function pipe(a: any, ...fns: Array<(x: any) => any>): any {
	return fns.reduce((acc, fn) => fn(acc), a);
}

/**
 * Compose - Compose functions right to left
 */
export function compose<A, B>(ab: (a: A) => B): (a: A) => B;
export function compose<A, B, C>(bc: (b: B) => C, ab: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(cd: (c: C) => D, bc: (b: B) => C, ab: (a: A) => B): (a: A) => D;
export function compose(...fns: Array<(x: any) => any>): (x: any) => any {
	return (x: any) => fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * Curry - Convert function to curried version
 */
export function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
	return (a: A) => (b: B) => fn(a, b);
}

/**
 * Tap - Apply side effect and return value
 */
export function tap<A>(fn: (a: A) => void): (a: A) => A {
	return (a: A) => {
		fn(a);
		return a;
	};
}

/**
 * Identity - Return value as is
 */
export function identity<A>(a: A): A {
	return a;
}

/**
 * Constant - Return constant value
 */
export function constant<A>(a: A): () => A {
	return () => a;
}

/**
 * Map - Transform array elements
 */
export function map<A, B>(fn: (a: A) => B): (arr: A[]) => B[] {
	return (arr: A[]) => arr.map(fn);
}

/**
 * Filter - Keep elements that match predicate
 */
export function filter<A>(predicate: (a: A) => boolean): (arr: A[]) => A[] {
	return (arr: A[]) => arr.filter(predicate);
}

/**
 * Reduce - Fold array into single value
 */
export function reduce<A, B>(fn: (acc: B, a: A) => B, initial: B): (arr: A[]) => B {
	return (arr: A[]) => arr.reduce(fn, initial);
}

/**
 * Find - Find first element matching predicate
 */
export function find<A>(predicate: (a: A) => boolean): (arr: A[]) => A | undefined {
	return (arr: A[]) => arr.find(predicate);
}

/**
 * Every - Check if all elements match predicate
 */
export function every<A>(predicate: (a: A) => boolean): (arr: A[]) => boolean {
	return (arr: A[]) => arr.every(predicate);
}

/**
 * Some - Check if any element matches predicate
 */
export function some<A>(predicate: (a: A) => boolean): (arr: A[]) => boolean {
	return (arr: A[]) => arr.some(predicate);
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
	const output = { ...target };

	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
				output[key] = deepMerge(output[key] || {}, source[key]) as any;
			} else {
				output[key] = source[key] as any;
			}
		}
	}

	return output;
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Calculate build time in human readable format
 */
export function formatBuildTime(ms: number): string {
	if (ms < 1000) return `${ms}ms`;

	const seconds = ms / 1000;
	if (seconds < 60) return `${seconds.toFixed(2)}s`;

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * Merge arrays and remove duplicates
 */
export function mergeUnique<T>(...arrays: T[][]): T[] {
	const result: T[] = [];
	const seen = new Set<T>();

	for (const array of arrays) {
		for (const item of array) {
			if (!seen.has(item)) {
				seen.add(item);
				result.push(item);
			}
		}
	}

	return result;
}

/**
 * Normalize input options
 */
export function normalizeInput(input: string | string[] | Record<string, string>): Record<string, string> {
	if (typeof input === "string") {
		return { main: input };
	}

	if (Array.isArray(input)) {
		const result: Record<string, string> = {};
		input.forEach((file, index) => {
			result[`entry-${index}`] = file;
		});
		return result;
	}

	return input;
}
