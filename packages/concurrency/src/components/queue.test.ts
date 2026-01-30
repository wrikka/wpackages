import { describe, expect, it } from "vitest";
import {
	clear,
	createPriorityQueue,
	createQueue,
	dequeue,
	dequeuePriority,
	enqueue,
	enqueuePriority,
	isEmpty,
	isEmptyPriority,
	isFull,
	peek,
	size,
} from "./queue";

describe("Queue", () => {
	it("should create a queue with initial items", () => {
		const queue = createQueue([1, 2, 3]);
		expect(size(queue)).toBe(3);
		expect(peek(queue)).toBe(1);
	});

	it("should enqueue items", () => {
		const queue = createQueue<number>();
		const queue1 = enqueue(queue, 1);
		const queue2 = enqueue(queue1, 2);

		expect(size(queue2)).toBe(2);
		expect(peek(queue2)).toBe(1);
	});

	it("should dequeue items", () => {
		const queue = createQueue([1, 2, 3]);
		const { queue: queue1, item: item1 } = dequeue(queue);
		const { queue: queue2, item: item2 } = dequeue(queue1);

		expect(item1).toBe(1);
		expect(item2).toBe(2);
		expect(size(queue2)).toBe(1);
		expect(peek(queue2)).toBe(3);
	});

	it("should handle dequeue on empty queue", () => {
		const queue = createQueue<number>();
		const { item } = dequeue(queue);
		expect(item).toBeUndefined();
	});

	it("should check if queue is empty", () => {
		const emptyQueue = createQueue<number>();
		const filledQueue = createQueue([1]);

		expect(isEmpty(emptyQueue)).toBe(true);
		expect(isEmpty(filledQueue)).toBe(false);
	});

	it("should clear queue", () => {
		const queue = createQueue([1, 2, 3]);
		const cleared = clear(queue);

		expect(isEmpty(cleared)).toBe(true);
		expect(size(cleared)).toBe(0);
	});

	it("should respect capacity limits", () => {
		const queue = createQueue<number>([], 2);

		const queue1 = enqueue(queue, 1);
		const queue2 = enqueue(queue1, 2);

		expect(() => enqueue(queue2, 3)).toThrow("Queue is at capacity");
		expect(isFull(queue2)).toBe(true);
	});

	it("should work with priority queue", () => {
		const pq = createPriorityQueue<string>();

		const pq1 = enqueuePriority(pq, "low", 3);
		const pq2 = enqueuePriority(pq1, "high", 1);
		const pq3 = enqueuePriority(pq2, "medium", 2);

		// Should dequeue in priority order (lowest number first)
		const { queue: pq4, item: item1 } = dequeuePriority(pq3);
		const { queue: pq5, item: item2 } = dequeuePriority(pq4);
		const { queue: pq6, item: item3 } = dequeuePriority(pq5);

		expect(item1).toBe("high");
		expect(item2).toBe("medium");
		expect(item3).toBe("low");

		expect(isEmptyPriority(pq6)).toBe(true);
	});

	it("should handle priority queue capacity", () => {
		const pq = createPriorityQueue<number>(2);

		const pq1 = enqueuePriority(pq, 1, 1);
		const pq2 = enqueuePriority(pq1, 2, 2);

		expect(() => enqueuePriority(pq2, 3, 3)).toThrow("Priority queue is at capacity");
	});
});
