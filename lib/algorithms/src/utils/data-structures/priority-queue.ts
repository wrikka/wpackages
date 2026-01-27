export interface PriorityQueue<T> {
	enqueue(item: T, priority: number): void;
	dequeue(): T | undefined;
	size(): number;
}

export const createPriorityQueue = <T>(): PriorityQueue<T> => {
	const items: { item: T; priority: number }[] = [];

	return {
		enqueue: (item: T, priority: number) => {
			items.push({ item, priority });
			items.sort((a, b) => a.priority - b.priority);
		},
		dequeue: () => {
			return items.shift()?.item;
		},
		size: () => items.length,
	};
};

export const pqEnqueue = <T>(queue: PriorityQueue<T>, item: T, priority: number): void => {
	queue.enqueue(item, priority);
};

export const pqDequeue = <T>(queue: PriorityQueue<T>): T | undefined => {
	return queue.dequeue();
};

export const pqSize = <T>(queue: PriorityQueue<T>): number => {
	return queue.size();
};
