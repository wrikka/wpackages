export const chunk = <T>(array: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
};

export const unique = <T>(array: T[]): T[] => {
	return Array.from(new Set(array));
};

export const flatten = <T>(array: T[][]): T[] => {
	return array.flat();
};

export const groupBy = <T, K extends string | number>(
	array: T[],
	keyFn: (item: T) => K,
): Record<K, T[]> => {
	return array.reduce((acc, item) => {
		const key = keyFn(item);
		(acc[key] = acc[key] || []).push(item);
		return acc;
	}, {} as Record<K, T[]>);
};
