import { type WeightedGraph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { floydWarshall } from "./floyd-warshall";

describe("floydWarshall", () => {
	it("should find all-pairs shortest paths in a simple directed graph", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 3 }, { node: "C", weight: 8 }, { node: "E", weight: -4 }]],
			["B", [{ node: "D", weight: 1 }, { node: "C", weight: 7 }]],
			["C", [{ node: "B", weight: 4 }]],
			["D", [{ node: "A", weight: 2 }, { node: "C", weight: -5 }]],
			["E", [{ node: "D", weight: 6 }]],
		]);

		const { dist } = floydWarshall(graph);

		expect(dist["A"]!["C"]).toBe(-3);
		expect(dist["A"]!["D"]).toBe(2);
		expect(dist["B"]!["A"]).toBe(3);
		expect(dist["E"]!["C"]).toBe(1);
	});

	it("should handle a graph with negative weights but no negative cycles", () => {
		const graph: WeightedGraph<string> = new Map([
			["0", [{ node: "1", weight: -1 }, { node: "2", weight: 4 }]],
			["1", [{ node: "2", weight: 3 }, { node: "3", weight: 2 }, { node: "4", weight: 2 }]],
			["2", []],
			["3", [{ node: "1", weight: 1 }, { node: "2", weight: 5 }]],
			["4", [{ node: "3", weight: -3 }]],
		]);

		const { dist } = floydWarshall(graph);

		expect(dist["0"]!["3"]).toBe(-2);
		expect(dist["4"]!["1"]).toBe(-2);
	});

	it("should handle unreachable nodes", () => {
		const graph: WeightedGraph<string> = new Map([
			["A", [{ node: "B", weight: 1 }]],
			["B", []],
			["C", [{ node: "D", weight: 1 }]],
			["D", []],
		]);

		const { dist } = floydWarshall(graph);

		expect(dist["A"]!["C"]).toBe(Infinity);
		expect(dist["C"]!["A"]).toBe(Infinity);
	});

	it("should handle a graph with a single node", () => {
		const graph: WeightedGraph<string> = new Map([["A", []]]);
		const { dist } = floydWarshall(graph);
		expect(dist).toEqual({ "A": { "A": 0 } });
	});
});
