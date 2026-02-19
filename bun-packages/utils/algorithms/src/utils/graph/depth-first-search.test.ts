import { type Graph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { depthFirstSearch } from "./depth-first-search";

describe("depthFirstSearch", () => {
	it("should perform DFS on a simple graph", () => {
		const graph: Graph<string> = new Map([
			["A", ["B", "C"]],
			["B", ["D", "E"]],
			["C", ["F"]],
			["D", []],
			["E", ["F"]],
			["F", []],
		]);
		const startNode = "A";
		const result = depthFirstSearch(graph, startNode);
		// The exact order can vary depending on implementation details (neighbor order)
		expect(result).toEqual(["A", "B", "D", "E", "F", "C"]);
	});

	it("should handle a graph with cycles", () => {
		const graph: Graph<number> = new Map([
			[1, [2, 3]],
			[2, [4]],
			[3, [1]], // Cycle 1 -> 3 -> 1
			[4, []],
		]);
		const startNode = 1;
		const result = depthFirstSearch(graph, startNode);
		expect(result).toEqual([1, 2, 4, 3]);
	});

	it("should handle a disconnected graph, visiting only the connected component", () => {
		const graph: Graph<string> = new Map([
			["A", ["B"]],
			["B", ["A"]],
			["C", ["D"]],
			["D", ["C"]],
		]);
		const startNode = "A";
		const result = depthFirstSearch(graph, startNode);
		expect(result).toEqual(["A", "B"]);
	});

	it("should handle a graph with a single node", () => {
		const graph: Graph<string> = new Map([["A", []]]);
		const startNode = "A";
		const result = depthFirstSearch(graph, startNode);
		expect(result).toEqual(["A"]);
	});

	it("should return an empty array if the start node is not in the graph", () => {
		const graph: Graph<string> = new Map([["A", ["B"]]]);
		const startNode = "C";
		const result = depthFirstSearch(graph, startNode);
		expect(result).toEqual([]);
	});

	it("should handle a linear graph (like a linked list)", () => {
		const graph: Graph<number> = new Map([
			[1, [2]],
			[2, [3]],
			[3, [4]],
			[4, []],
		]);
		const startNode = 1;
		const result = depthFirstSearch(graph, startNode);
		expect(result).toEqual([1, 2, 3, 4]);
	});
});
