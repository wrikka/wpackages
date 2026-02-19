import { describe, expect, it } from "vitest";
import { bipartiteMatching } from "./bipartite-matching";

describe("bipartiteMatching", () => {
	it("should find the maximum bipartite matching", () => {
		const graph = {
			A: ["X", "Y"],
			B: ["Y", "Z"],
			C: ["X"],
			D: ["Z"],
		};

		const leftSet = ["A", "B", "C", "D"];
		const rightSet = ["X", "Y", "Z"];

		const matching = bipartiteMatching(graph, leftSet, rightSet);
		expect(matching.length).toBe(3);
	});

	it("should handle graphs with no matching", () => {
		const graph = {
			A: [],
			B: [],
		};

		const leftSet = ["A", "B"];
		const rightSet = ["X", "Y"];

		expect(bipartiteMatching(graph, leftSet, rightSet)).toEqual([]);
	});
});
