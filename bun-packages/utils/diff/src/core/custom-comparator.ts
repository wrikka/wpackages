export type Comparator = (a: unknown, b: unknown) => boolean;

export interface CustomDiffOptions {
	comparators?: Record<string, Comparator>;
	defaultComparator?: Comparator;
}

const defaultComparator: Comparator = (a, b) => {
	return JSON.stringify(a) === JSON.stringify(b);
};

export function compareWithCustomStrategy(
	expected: unknown,
	actual: unknown,
	options: CustomDiffOptions = {},
): boolean {
	const { comparators = {}, defaultComparator: customDefault = defaultComparator } = options;

	const typeA = getType(expected);
	const typeB = getType(actual);

	if (typeA !== typeB) {
		return false;
	}

	const type = typeA;

	if (comparators[type]) {
		return comparators[type]!(expected, actual);
	}

	return customDefault(expected, actual);
}

function getType(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	if (value instanceof Map) return "map";
	if (value instanceof Set) return "set";
	if (value instanceof Date) return "date";
	if (value instanceof RegExp) return "regexp";
	return typeof value;
}

export const builtInComparators: Record<string, Comparator> = {
	date: (a, b) => {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	},
	regexp: (a, b) => {
		return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags;
	},
	map: (a, b) => {
		if (!(a instanceof Map) || !(b instanceof Map)) return false;
		if (a.size !== b.size) return false;
		for (const [key, value] of a.entries()) {
			if (!b.has(key) || !compareWithCustomStrategy(value, b.get(key))) {
				return false;
			}
		}
		return true;
	},
	set: (a, b) => {
		if (!(a instanceof Set) || !(b instanceof Set)) return false;
		if (a.size !== b.size) return false;
		for (const value of a) {
			let found = false;
			for (const bValue of b) {
				if (compareWithCustomStrategy(value, bValue)) {
					found = true;
					break;
				}
			}
			if (!found) return false;
		}
		return true;
	},
};
