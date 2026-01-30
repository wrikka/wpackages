import { type WeightedGraph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { kruskalsAlgorithm } from "./kruskals-algorithm";

describe("kruskalsAlgorithm", () => {
	it("should find the Minimum Spanning Tree of a simple graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 2 }, { node: "D", weight: 3 }]],
			["B", [{ node: "A", weight: 2 }, { node: "C", weight: 3 }, { node: "D", weight: 5 }]],
			["C", [{ node: "B", weight: 3 }, { node: "D", weight: 1 }]],
			["D", [{ node: "A", weight: 3 }, { node: "B", weight: 5 }, { node: "C", weight: 1 }]],
		]);

		const mst = kruskalsAlgorithm(graph);
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		expect(mst.length).toBe(3); // A connected graph with 4 vertices has an MST with 3 edges
		expect(totalWeight).toBe(6); // Edges: (C-D, 1), (A-B, 2), (B-C, 3)
	});

	it("should handle a graph with multiple possible MSTs", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }, { node: "C", weight: 2 }]],
			["B", [{ node: "A", weight: 1 }, { node: "C", weight: 2 }]],
			["C", [{ node: "A", weight: 2 }, { node: "B", weight: 2 }]],
		]);

		const mst = kruskalsAlgorithm(graph);
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		expect(mst.length).toBe(2);
		expect(totalWeight).toBe(3); // (A-B, 1) and either (A-C, 2) or (B-C, 2)
	});

	it("should find a Minimum Spanning Forest in a disconnected graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", [{ node: "A", weight: 1 }]],
			["C", [{ node: "D", weight: 2 }]],
			["D", [{ node: "C", weight: 2 }]],
		]);

		const msf = kruskalsAlgorithm(graph);
		const totalWeight = msf.reduce((sum, edge) => sum + edge.weight, 0);

		expect(msf.length).toBe(2); // One edge for each component
		expect(totalWeight).toBe(3);
	});

	it("should return an empty array for a graph with a single node", () => {
		const graph: WeightedGraph<string> = new Map([["A", []]]);
		const mst = kruskalsAlgorithm(graph);
		expect(mst).toEqual([]);
	});

	it("should work for a complete graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 10 }, { node: "C", weight: 15 }]],
			["B", [{ node: "A", weight: 10 }, { node: "C", weight: 35 }]],
			["C", [{ node: "A", weight: 15 }, { node: "B", weight: 35 }]],
		]);

		const mst = kruskalsAlgorithm(graph);
		const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

		expect(mst.length).toBe(2);
		expect(totalWeight).toBe(25); // Edges (A-B, 10) and (A-C, 15)
	});
});
