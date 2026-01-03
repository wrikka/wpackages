import { describe, expect, it } from "bun:test";
import { ChangeType, lcs } from "./lcs";

describe("lcs", () => {
	it("should detect common, added, and deleted items", () => {
		const a = ["a", "b", "c", "d"];
		const b = ["a", "x", "c", "e"];

		const result = lcs(a, b);

		expect(result).toEqual([
			{ type: ChangeType.COMMON, value: "a", indexA: 0, indexB: 0 },
			{ type: ChangeType.DELETE, value: "b", indexA: 1 },
			{ type: ChangeType.ADD, value: "x", indexB: 1 },
			{ type: ChangeType.COMMON, value: "c", indexA: 2, indexB: 2 },
			{ type: ChangeType.DELETE, value: "d", indexA: 3 },
			{ type: ChangeType.ADD, value: "e", indexB: 3 },
		]);
	});

	it("should handle additions at the end", () => {
		const a = [1, 2];
		const b = [1, 2, 3];
		const result = lcs(a, b);
		expect(result.filter(c => c.type === ChangeType.ADD).map(c => c.value)).toEqual([3]);
	});

	it("should handle deletions at the end", () => {
		const a = [1, 2, 3];
		const b = [1, 2];
		const result = lcs(a, b);
		expect(result.filter(c => c.type === ChangeType.DELETE).map(c => c.value)).toEqual([3]);
	});

	it("should handle completely different arrays", () => {
		const a = [1, 2, 3];
		const b = [4, 5, 6];
		const result = lcs(a, b);
		expect(result.filter(c => c.type === ChangeType.DELETE).length).toBe(3);
		expect(result.filter(c => c.type === ChangeType.ADD).length).toBe(3);
	});
});
