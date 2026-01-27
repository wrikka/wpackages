export interface Heap<T> {
	items: T[];
	comparator: Comparator<T>;
}

export interface Comparator<T> {
	(a: T, b: T): number;
}

export const createHeap = <T>(comparator: Comparator<T>): Heap<T> => ({
	items: [],
	comparator,
});

export const heapInsert = <T>(heap: Heap<T>, item: T): void => {
	heap.items.push(item);
	heapifyUp(heap, heap.items.length - 1);
};

export const heapExtract = <T>(heap: Heap<T>): T | undefined => {
	if (heap.items.length === 0) return undefined;
	if (heap.items.length === 1) return heap.items.pop()!;

	const root = heap.items[0];
	const lastItem = heap.items.pop()!;
	if (heap.items.length > 0) {
		heap.items[0] = lastItem;
		heapifyDown(heap, 0);
	}
	return root;
};

export const heapIsEmpty = <T>(heap: Heap<T>): boolean => {
	return heap.items.length === 0;
};

const heapifyUp = <T>(heap: Heap<T>, index: number): void => {
	if (index === 0) return;

	const parentIndex = Math.floor((index - 1) / 2);
	const currentItem = heap.items[index];
	const parentItem = heap.items[parentIndex];
	
	if (currentItem && parentItem) {
		const comparison = heap.comparator(currentItem, parentItem);
		if (comparison < 0) {
			heap.items[index] = parentItem;
			heap.items[parentIndex] = currentItem;
			heapifyUp(heap, parentIndex);
		}
	}
};

const heapifyDown = <T>(heap: Heap<T>, index: number): void => {
	const leftChild = 2 * index + 1;
	const rightChild = 2 * index + 2;
	let smallest = index;

	const currentItem = heap.items[index];
	const leftItem = heap.items[leftChild];
	const rightItem = heap.items[rightChild];

	if (leftItem && currentItem) {
		const comparison = heap.comparator(leftItem, currentItem);
		if (comparison < 0) {
			smallest = leftChild;
		}
	}

	if (rightItem) {
		const smallestItem = heap.items[smallest];
		if (smallestItem) {
			const comparison = heap.comparator(rightItem, smallestItem);
			if (comparison < 0) {
				smallest = rightChild;
			}
		}
	}

	if (smallest !== index && currentItem) {
		const smallestItem = heap.items[smallest]!;
		heap.items[index] = smallestItem;
		heap.items[smallest] = currentItem;
		heapifyDown(heap, smallest);
	}
};
