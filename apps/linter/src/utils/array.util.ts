/**
 * Functional array utilities
 */

export const filter = <T>(
	arr: readonly T[],
	predicate: (item: T) => boolean,
): readonly T[] => arr.filter(predicate);

export const map = <T, U>(
	arr: readonly T[],
	fn: (item: T) => U,
): readonly U[] => arr.map(fn);

export const flatMap = <T, U>(
	arr: readonly T[],
	fn: (item: T) => readonly U[],
): readonly U[] => arr.flatMap(fn);

export const reduce = <T, U>(
	arr: readonly T[],
	fn: (acc: U, item: T) => U,
	initial: U,
): U => arr.reduce(fn, initial);

export const partition = <T>(
	arr: readonly T[],
	predicate: (item: T) => boolean,
): readonly [readonly T[], readonly T[]] => {
	const truthy: T[] = [];
	const falsy: T[] = [];

	for (const item of arr) {
		if (predicate(item)) {
			truthy.push(item);
		} else {
			falsy.push(item);
		}
	}

	return [truthy, falsy];
};

export const groupBy = <T, K extends string | number>(
	arr: readonly T[],
	keyFn: (item: T) => K,
): Record<K, readonly T[]> => {
	const result = {} as Record<K, T[]>;

	for (const item of arr) {
		const key = keyFn(item);
		if (!result[key]) {
			result[key] = [];
		}
		result[key].push(item);
	}

	return result;
};

export const unique = <T>(arr: readonly T[]): readonly T[] => [...new Set(arr)];

export const sortBy = <T>(
	arr: readonly T[],
	keyFn: (item: T) => number | string,
): readonly T[] =>
	[...arr].sort((a, b) => {
		const aKey = keyFn(a);
		const bKey = keyFn(b);
		return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
	});

export const isEmpty = <T>(arr: readonly T[]): boolean => arr.length === 0;

export const isNotEmpty = <T>(arr: readonly T[]): boolean => arr.length > 0;
