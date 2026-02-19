import { describe, expect, it } from "vitest";
import { LinkedList } from "./linked-list";

describe("LinkedList", () => {
	it("should append and prepend items", () => {
		const list = new LinkedList<number>();
		list.append(1);
		list.append(2);
		list.prepend(0);
		expect(list.toArray()).toEqual([0, 1, 2]);
	});

	it("should delete items", () => {
		const list = new LinkedList<number>();
		list.append(1);
		list.append(2);
		list.append(3);
		list.delete(2);
		expect(list.toArray()).toEqual([1, 3]);
	});

	it("should find items", () => {
		const list = new LinkedList<number>();
		list.append(1);
		list.append(2);
		expect(list.find(2)).toBeTruthy();
		expect(list.find(3)).toBeNull();
	});
});
