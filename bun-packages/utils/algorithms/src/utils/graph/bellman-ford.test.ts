import { type WeightedGraph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { bellmanFord } from "./bellman-ford";

describe("bellmanFord", () => {
	it("should find the shortest paths in a simple graph with positive weights", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 6 }, { node: "D", weight: 1 }]],
			["B", [{ node: "A", weight: 6 }, { node: "D", weight: 2 }, { node: "E", weight: 2 }]],
			["C", [{ node: "B", weight: 5 }, { node: "E", weight: 5 }]],
			["D", [{ node: "A", weight: 1 }, { node: "B", weight: 2 }, { node: "E", weight: 1 }]],
			["E", [{ node: "B", weight: 2 }, { node: "C", weight: 5 }, { node: "D", weight: 1 }]],
		]);
		const startNode = "A";
		const result = bellmanFord(graph, startNode);

		expect(result.hasNegativeCycle).toBe(false);
		expect(result.distances).toEqual({ A: 0, B: 3, C: 7, D: 1, E: 2 });
		expect(result.previous).toEqual({ A: null, B: "D", C: "E", D: "A", E: "D" });
	});

	it("should handle a graph with negative weights but no negative cycle", () => {
		const graph: WeightedGraph<string> = new Map([
			["S", [{ node: "A", weight: 4 }, { node: "E", weight: -5 }]],
			["A", [{ node: "C", weight: -2 }]],
			["B", [{ node: "A", weight: 3 }]],
			["C", [{ node: "D", weight: 1 }]],
			["D", [{ node: "B", weight: -1 }]],
			["E", [{ node: "D", weight: 2 }]],
		]);
		const startNode = "S";
		const result = bellmanFord(graph, startNode);

		expect(result.hasNegativeCycle).toBe(false);
		expect(result.distances).toEqual({ S: 0, A: -1, B: -4, C: -3, D: -3, E: -5 });
	});

	it("should detect a negative-weight cycle", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", [{ node: "C", weight: -1 }]],
			["C", [{ node: "D", weight: -1 }]],
			["D", [{ node: "B", weight: -1 }]], // Negative cycle B -> C -> D -> B
		]);
		const startNode = "A";
		const result = bellmanFord(graph, startNode);

		expect(result.hasNegativeCycle).toBe(true);
	});

	it("should handle unreachable nodes", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["C", [{ node: "D", weight: 1 }]],
			["B", []],
			["D", []],
		]);
		const startNode = "A";
		const result = bellmanFord(graph, startNode);

		expect(result.hasNegativeCycle).toBe(false);
		expect(result.distances).toEqual({ A: 0, B: 1, C: Infinity, D: Infinity });
	});

	it("should handle a graph with a single node", () => {
		const graph: WeightedGraph<string> = new Map([["A", []]]);
		const startNode = "A";
		const result = bellmanFord(graph, startNode);

		expect(result.hasNegativeCycle).toBe(false);
		expect(result.distances).toEqual({ A: 0 });
		expect(result.previous).toEqual({ A: null });
	});
});
