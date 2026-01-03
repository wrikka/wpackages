import { describe, expect, it } from "bun:test";
import { diff } from "./diff";
import { patch, unpatch } from "./patch";

describe("patch and unpatch", () => {
	it("should apply a diff to an object (patch)", () => {
		const source: any = { a: 1, b: { c: 2 }, d: 5 };
		const target: any = { a: 1, b: { c: 3 }, e: 6 };

		const diffResult = diff(source, target);
		expect(diffResult).toBeDefined();

		const patched = patch(source, diffResult!);
		expect(patched).toEqual(target);
		expect(source.b.c).toBe(2); // Ensure source is not mutated
	});

	it("should revert a diff from an object (unpatch)", () => {
		const source: any = { a: 1, b: { c: 2 }, d: 5 };
		const target: any = { a: 1, b: { c: 3 }, e: 6 };

		const diffResult = diff(source, target);
		expect(diffResult).toBeDefined();

		const unpatched = unpatch(target, diffResult!);
		expect(unpatched).toEqual(source);
		expect(target.b.c).toBe(3); // Ensure target is not mutated
	});

	it("should handle nested patches correctly", () => {
		const source = { a: { b: { c: 1 } } };
		const target = { a: { b: { c: 2, d: 3 } } };

		const diffResult = diff(source, target);
		const patched = patch(source, diffResult!);

		expect(patched).toEqual(target);
	});

	it("should handle array patches", () => {
		const source = { data: [1, 2, 3] };
		const target = { data: [1, 2, 4, 5] };

		const diffResult = diff(source, target);
		console.log("diffResult for array patch:", JSON.stringify(diffResult, null, 2));
		const patched = patch(source, diffResult!);

		expect(patched).toEqual(target);
	});

	it("should handle Map patches", () => {
		const source = new Map<string, any>([["a", 1], ["b", { x: 10 }]]);
		const target = new Map<string, any>([["a", 2], ["c", { y: 20 }]]);

		const diffResult = diff(source, target);
		const patched = patch(source, diffResult!);

		expect(patched).toEqual(target);
	});
});
