export async function parallelSort<T>(array: T[], compareFn?: (a: T, b: T) => number, concurrency: number = 4): Promise<T[]> {
	if (array.length <= 1000 && !compareFn) {
		const sorted = [...array];
		sorted.sort();
		return sorted;
	}

	const chunkSize = Math.ceil(array.length / concurrency);
	const chunks: T[][] = [];

	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	const sortedChunks = await Promise.all(chunks.map((chunk) => {
		const sorted = [...chunk];
		sorted.sort(compareFn);
		return sorted;
	}));

	return mergeSortedArrays(sortedChunks, compareFn);
}

function mergeSortedArrays<T>(arrays: T[][], compareFn?: (a: T, b: T) => number): T[] {
	if (arrays.length === 0) return [];
	if (arrays.length === 1) return arrays[0]!;

	const compare = compareFn || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
	const result: T[] = [];
	const indices = Array.from({ length: arrays.length }, () => 0);

	while (true) {
		let bestIndex = -1;
		let bestValue: T | null = null;

		for (let i = 0; i < arrays.length; i++) {
			if (indices[i]! < arrays[i]!.length) {
				const currentValue = arrays[i]![indices[i]!]!;
				if (bestValue === null || compare(currentValue, bestValue) < 0) {
					bestValue = currentValue;
					bestIndex = i;
				}
			}
		}

		if (bestIndex === -1) break;

		result.push(bestValue!);
		indices[bestIndex]!++;
	}

	return result;
}
