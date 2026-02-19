import { type WeightedGraph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { primsAlgorithm } from "./prims-algorithm";

describe("primsAlgorithm", () => {
	it("should find the Minimum Spanning Tree of a simple graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 2 }, { node: "D", weight: 3 }]],
			["B", [{ node: "A", weight: 2 }, { node: "C", weight: 3 }, { node: "D", weight: 5 }]],
			["C", [{ node: "B", weight: 3 }, { node: "D", weight: 1 }]],
			["D", [{ node: "A", weight: 3 }, { node: "B", weight: 5 }, { node: "C", weight: 1 }]],
		]);

		const mst = primsAlgorithm(graph, "A");
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		expect(mst.length).toBe(3);
		expect(totalWeight).toBe(6); // Edges: (A-B, 2), (B-C, 3), (C-D, 1) -> this depends on start node and implementation
	});

	it("should handle a disconnected graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", [{ node: "A", weight: 1 }]],
			["C", [{ node: "D", weight: 2 }]],
			["D", [{ node: "C", weight: 2 }]],
		]);

		const mst = primsAlgorithm(graph, "A");
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		// Prim's only finds the MST for the connected component of the start node
		expect(mst.length).toBe(1);
		expect(totalWeight).toBe(1);
	});

	it("should return an empty array for a graph with a single node", () => {
		const graph: WeightedGraph<string> = new Map([["A", []]]);
		const mst = primsAlgorithm(graph, "A");
		expect(mst).toEqual([]);
	});

	it("should return an empty array if the start node is not in the graph", () => {
		const graph: WeightedGraph<string> = new Map([["A", [{ node: "B", weight: 1 }]]]);
		const mst = primsAlgorithm(graph, "C");
		expect(mst).toEqual([]);
	});

	it("should work for a complete graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 10 }, { node: "C", weight: 15 }]],
			["B", [{ node: "A", weight: 10 }, { node: "C", weight: 35 }]],
			["C", [{ node: "A", weight: 15 }, { node: "B", weight: 35 }]],
		]);

		const mst = primsAlgorithm(graph, "B");
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		expect(mst.length).toBe(2);
		expect(totalWeight).toBe(25); // Edges (B-A, 10) and (A-C, 15)
	});
});
