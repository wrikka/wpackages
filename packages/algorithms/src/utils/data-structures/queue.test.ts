import { describe, expect, it } from "vitest";
import { Queue } from "./queue";

describe("Queue", () => {
	it("should enqueue and dequeue items correctly", () => {
		const queue = new Queue<string>();
		queue.enqueue("first");
		queue.enqueue("second");
		expect(queue.dequeue()).toBe("first");
		expect(queue.dequeue()).toBe("second");
	});

	it("should peek at the front item", () => {
		const queue = new Queue<string>();
		queue.enqueue("first");
		queue.enqueue("second");
		expect(queue.front()).toBe("first");
		expect(queue.size()).toBe(2);
	});

	it("should check if empty", () => {
		const queue = new Queue<string>();
		expect(queue.isEmpty()).toBe(true);
		queue.enqueue("first");
		expect(queue.isEmpty()).toBe(false);
	});
});
