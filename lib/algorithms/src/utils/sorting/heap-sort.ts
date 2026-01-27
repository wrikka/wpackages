import {
	type Comparator,
	createHeap,
	type Heap,
	heapExtract,
	heapInsert,
	heapIsEmpty,
} from "../data-structures";

export function heapSort<T extends number | string>(arr: T[]): T[] {
	if (arr.length <= 1) {
		return [...arr];
	}

	const comparator: Comparator<T> = (a: T, b: T) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	const minHeap: Heap<T> = createHeap<T>(comparator);

	for (const item of arr) {
		heapInsert(minHeap, item);
	}

	const result: T[] = [];
	while (!heapIsEmpty(minHeap)) {
		const min = heapExtract(minHeap);
		if (min !== undefined) {
			result.push(min);
		}
	}

	return result;
}
