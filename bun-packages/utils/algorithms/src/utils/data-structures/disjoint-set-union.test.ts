import { describe, expect, it } from "vitest";
import { DisjointSetUnion } from "./disjoint-set-union";

describe("DisjointSetUnion", () => {
	it("should union and find sets", () => {
		const dsu = new DisjointSetUnion(5);
		dsu.union(0, 1);
		dsu.union(1, 2);
		expect(dsu.connected(0, 2)).toBe(true);
		expect(dsu.connected(0, 3)).toBe(false);
	});

	it("should handle path compression", () => {
		const dsu = new DisjointSetUnion(3);
		dsu.union(0, 1);
		dsu.union(1, 2);
		expect(dsu.find(0)).toBe(dsu.find(2));
	});
});
