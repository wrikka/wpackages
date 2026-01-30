import { type WeightedGraph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { dijkstra } from "./dijkstra";

describe("dijkstra", () => {
	it("should find the shortest paths in a simple graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }, { node: "C", weight: 4 }]],
			["B", [{ node: "A", weight: 1 }, { node: "C", weight: 2 }, { node: "D", weight: 5 }]],
			["C", [{ node: "A", weight: 4 }, { node: "B", weight: 2 }]],
			["D", [{ node: "B", weight: 5 }]],
		]);
		const startNode = "A";
		const { distances, previous } = dijkstra(graph, startNode);

		expect(distances).toEqual({ A: 0, B: 1, C: 3, D: 6 });
		expect(previous).toEqual({ A: null, B: "A", C: "B", D: "B" });
	});

	it("should handle a more complex graph where direct path is not shortest", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }, { node: "C", weight: 10 }]],
			["B", [{ node: "D", weight: 2 }]],
			["C", [{ node: "D", weight: 1 }]],
			["D", []],
		]);
		const startNode = "A";
		const { distances } = dijkstra(graph, startNode);
		expect(distances).toEqual({ A: 0, B: 1, C: 10, D: 3 });
	});

	it("should handle unreachable nodes", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", []],
			["C", [{ node: "D", weight: 1 }]],
			["D", []],
		]);
		const startNode = "A";
		const { distances } = dijkstra(graph, startNode);
		expect(distances).toEqual({ A: 0, B: 1, C: Infinity, D: Infinity });
	});

	it("should handle a graph with a single node", () => {
		const graph: WeightedGraph<string> = new Map([["A", []]]);
		const startNode = "A";
		const { distances, previous } = dijkstra(graph, startNode);
		expect(distances).toEqual({ A: 0 });
		expect(previous).toEqual({ A: null });
	});

	it("should handle a graph with cycles", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", [{ node: "C", weight: 1 }]],
			["C", [{ node: "A", weight: 1 }]],
		]);
		const startNode = "A";
		const { distances } = dijkstra(graph, startNode);
		expect(distances).toEqual({ A: 0, B: 1, C: 2 });
	});
});
