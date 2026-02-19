export async function parallelSearch<T>(
	array: T[],
	target: T,
	compareFn?: (a: T, b: T) => number,
	concurrency: number = 4,
): Promise<number> {
	if (array.length <= 1000) {
		for (let i = 0; i < array.length; i++) {
			if (array[i] === target) return i;
		}
		return -1;
	}

	const chunkSize = Math.ceil(array.length / concurrency);
	const chunks: T[][] = [];

	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	const searchPromises = chunks.map((chunk, index) =>
		Promise.resolve({
			chunkIndex: index,
			result: chunk.findIndex((item) => item === target),
		})
	);

	const results = await Promise.all(searchPromises);

	for (const { chunkIndex, result } of results) {
		if (result !== -1) {
			return chunkIndex * chunkSize + result;
		}
	}

	return -1;
}
