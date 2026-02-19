import { describe, expect, it } from "vitest";
import { Stack } from "./stack";

describe("Stack", () => {
	it("should push and pop items correctly", () => {
		const stack = new Stack<number>();
		stack.push(1);
		stack.push(2);
		expect(stack.pop()).toBe(2);
		expect(stack.pop()).toBe(1);
	});

	it("should peek at the top item", () => {
		const stack = new Stack<number>();
		stack.push(1);
		stack.push(2);
		expect(stack.peek()).toBe(2);
		expect(stack.size()).toBe(2);
	});

	it("should check if empty", () => {
		const stack = new Stack<number>();
		expect(stack.isEmpty()).toBe(true);
		stack.push(1);
		expect(stack.isEmpty()).toBe(false);
	});
});
