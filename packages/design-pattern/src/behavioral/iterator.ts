/**
 * Iterator Pattern - Pure functional implementation
 */

export const createIterator = <T>(items: readonly T[]) => {
	let index = 0;
	return {
		next: (): { value: T | undefined; done: boolean } => {
			if (index < items.length) {
				return { value: items[index++], done: false };
			}
			return { value: undefined, done: true };
		},
		hasNext: (): boolean => index < items.length,
		reset: () => {
			index = 0;
		},
	};
};

export const createReverseIterator = <T>(items: readonly T[]) => {
	let index = items.length - 1;
	return {
		next: (): { value: T | undefined; done: boolean } => {
			if (index >= 0) {
				return { value: items[index--], done: false };
			}
			return { value: undefined, done: true };
		},
		hasNext: (): boolean => index >= 0,
		reset: () => {
			index = items.length - 1;
		},
	};
};

export const map = <T, R>(
	iterator: ReturnType<typeof createIterator<T>>,
	fn: (value: T) => R,
) => {
	const results: R[] = [];
	let result = iterator.next();
	while (!result.done && result.value !== undefined) {
		results.push(fn(result.value));
		result = iterator.next();
	}
	return results;
};
