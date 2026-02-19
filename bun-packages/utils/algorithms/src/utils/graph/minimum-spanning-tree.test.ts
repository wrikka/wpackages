import { describe, expect, it } from "vitest";
import { minimumSpanningTree } from "./minimum-spanning-tree";

describe("minimumSpanningTree", () => {
	it("should find the minimum spanning tree", () => {
		const nodes = ["A", "B", "C", "D"];

		const edges = [
			{ from: "A", to: "B", weight: 1 },
			{ from: "A", to: "C", weight: 3 },
			{ from: "B", to: "C", weight: 2 },
			{ from: "B", to: "D", weight: 4 },
			{ from: "C", to: "D", weight: 5 },
		];

		const mst = minimumSpanningTree(edges, nodes);
		const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0);

		expect(mst.length).toBe(nodes.length - 1);
		expect(totalWeight).toBe(7);
	});

	it("should handle disconnected graphs", () => {
		const nodes = ["A", "B", "C"];

		const edges = [{ from: "A", to: "B", weight: 1 }];

		const mst = minimumSpanningTree(edges, nodes);
		expect(mst.length).toBe(1);
	});
});
