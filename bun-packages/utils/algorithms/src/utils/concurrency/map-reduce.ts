export interface MapReduceOptions<K, V, M, R> {
	mapper: (value: V) => Promise<M> | M;
	reducer: (accumulator: R, current: M) => Promise<R> | R;
	initialValue: R;
	concurrency?: number;
}

export async function mapReduce<V, M, R>(
	data: V[],
	options: MapReduceOptions<any, V, M, R>,
): Promise<R> {
	const { mapper, reducer, initialValue, concurrency = 4 } = options;

	const chunkSize = Math.ceil(data.length / concurrency);
	const chunks: V[][] = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		chunks.push(data.slice(i, i + chunkSize));
	}

	const mapPromises = chunks.map(async (chunk) => {
		const mapped = await Promise.all(chunk.map((value) => mapper(value)));
		let result = initialValue;
		for (const item of mapped) {
			result = await reducer(result, item);
		}
		return result;
	});

	const reducedChunks = await Promise.all(mapPromises);

	let finalResult = initialValue;
	for (const chunkResult of reducedChunks) {
		finalResult = await reducer(finalResult, chunkResult as unknown as M);
	}
	return finalResult;
}

export async function parallelMap<T, R>(data: T[], mapper: (value: T) => Promise<R> | R, concurrency: number = 4): Promise<R[]> {
	const chunkSize = Math.ceil(data.length / concurrency);
	const chunks: T[][] = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		chunks.push(data.slice(i, i + chunkSize));
	}

	const results = await Promise.all(chunks.map((chunk) => Promise.all(chunk.map(mapper))));

	return results.flat();
}

export async function parallelReduce<T, R>(data: T[], reducer: (accumulator: R, current: T) => Promise<R> | R, initialValue: R, concurrency: number = 4): Promise<R> {
	const chunkSize = Math.ceil(data.length / concurrency);
	const chunks: T[][] = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		chunks.push(data.slice(i, i + chunkSize));
	}

	const reducedChunks = await Promise.all(
		chunks.map(async (chunk) => {
			let result = initialValue;
			for (const item of chunk) {
				result = await reducer(result, item);
			}
			return result;
		}),
	);

	let finalResult = initialValue;
	for (const chunkResult of reducedChunks) {
		finalResult = await reducer(finalResult, chunkResult as unknown as T);
	}
	return finalResult;
}
