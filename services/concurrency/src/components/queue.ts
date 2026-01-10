/**
 * Queue - Functional Queue Implementation with Advanced Features
 */

export type Queue<T> = {
	items: T[];
	capacity: number | undefined;
};

export type PriorityQueueItem<T> = {
	item: T;
	priority: number;
};

export type PriorityQueue<T> = {
	items: PriorityQueueItem<T>[];
	capacity: number | undefined;
};

export const createQueue = <T>(initialItems: T[] = [], capacity?: number): Queue<T> => ({
	items: [...initialItems],
	capacity,
});

export const enqueue = <T>(queue: Queue<T>, item: T): Queue<T> => {
	if (queue.capacity !== undefined && queue.items.length >= queue.capacity) {
		throw new Error("Queue is at capacity");
	}
	return { ...queue, items: [...queue.items, item] };
};

export const dequeue = <T>(queue: Queue<T>): { queue: Queue<T>; item: T | undefined } => {
	if (queue.items.length === 0) {
		return { queue, item: undefined };
	}
	const [item, ...remaining] = queue.items;
	return { queue: { ...queue, items: remaining }, item };
};

export const peek = <T>(queue: Queue<T>): T | undefined => {
	return queue.items[0];
};

export const size = <T>(queue: Queue<T>): number => {
	return queue.items.length;
};

export const isEmpty = <T>(queue: Queue<T>): boolean => {
	return queue.items.length === 0;
};

export const clear = <T>(queue: Queue<T>): Queue<T> => ({
	...queue,
	items: [],
});

export const isFull = <T>(queue: Queue<T>): boolean => {
	return queue.capacity !== undefined && queue.items.length >= queue.capacity;
};

// Priority Queue Implementation
export const createPriorityQueue = <T>(capacity?: number): PriorityQueue<T> => ({
	items: [],
	capacity,
});

export const enqueuePriority = <T>(queue: PriorityQueue<T>, item: T, priority: number): PriorityQueue<T> => {
	if (queue.capacity !== undefined && queue.items.length >= queue.capacity) {
		throw new Error("Priority queue is at capacity");
	}

	const newItem: PriorityQueueItem<T> = { item, priority };
	const newItems = [...queue.items, newItem].sort((a, b) => a.priority - b.priority);

	return { ...queue, items: newItems };
};

export const dequeuePriority = <T>(queue: PriorityQueue<T>): { queue: PriorityQueue<T>; item: T | undefined } => {
	if (queue.items.length === 0) {
		return { queue, item: undefined };
	}

	const [first, ...remaining] = queue.items;
	return { queue: { ...queue, items: remaining }, item: first?.item };
};

export const peekPriority = <T>(queue: PriorityQueue<T>): T | undefined => {
	return queue.items[0]?.item;
};

export const sizePriority = <T>(queue: PriorityQueue<T>): number => {
	return queue.items.length;
};

export const isEmptyPriority = <T>(queue: PriorityQueue<T>): boolean => {
	return queue.items.length === 0;
};

export const clearPriority = <T>(queue: PriorityQueue<T>): PriorityQueue<T> => ({
	...queue,
	items: [],
});
