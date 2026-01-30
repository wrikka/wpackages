import { type Graph } from "../data-structures";
import { describe, expect, it } from "vitest";
import { topologicalSort } from "./topological-sort";

describe("topologicalSort", () => {
	it("should perform topological sort on a simple DAG", () => {
		const graph: Graph<string> = new Map([
			["A", ["C"]],
			["B", ["C", "D"]],
			["C", ["E"]],
			["D", ["F"]],
			["E", ["F"]],
			["F", []],
		]);
		const sorted = topologicalSort(graph);
		// A valid topological sort could be [B, D, A, C, E, F] or [A, B, D, C, E, F], etc.
		// We will check for correctness by verifying dependencies.
		expect(sorted).not.toBeNull();
		expect(sorted!.indexOf("A")).toBeLessThan(sorted!.indexOf("C"));
		expect(sorted!.indexOf("B")).toBeLessThan(sorted!.indexOf("C"));
		expect(sorted!.indexOf("B")).toBeLessThan(sorted!.indexOf("D"));
		expect(sorted!.indexOf("C")).toBeLessThan(sorted!.indexOf("E"));
		expect(sorted!.indexOf("D")).toBeLessThan(sorted!.indexOf("F"));
		expect(sorted!.indexOf("E")).toBeLessThan(sorted!.indexOf("F"));
	});

	it("should return null for a graph with a cycle", () => {
		const graph: Graph<number> = new Map([
			[1, [2]],
			[2, [3]],
			[3, [1]], // Cycle
			[4, [1]],
		]);
		const sorted = topologicalSort(graph);
		expect(sorted).toBeNull();
	});

	it("should handle a disconnected DAG", () => {
		const graph: Graph<string> = new Map([
			["A", ["B"]],
			["B", []],
			["C", ["D"]],
			["D", []],
		]);
		const sorted = topologicalSort(graph);
		expect(sorted).not.toBeNull();
		expect(sorted!.length).toBe(4);
		expect(sorted!.indexOf("A")).toBeLessThan(sorted!.indexOf("B"));
		expect(sorted!.indexOf("C")).toBeLessThan(sorted!.indexOf("D"));
	});

	it("should handle a graph with a single node", () => {
		const graph: Graph<string> = new Map([["A", []]]);
		const sorted = topologicalSort(graph);
		expect(sorted).toEqual(["A"]);
	});

	it("should return an empty array for an empty graph", () => {
		const graph: Graph<string> = new Map();
		const sorted = topologicalSort(graph);
		expect(sorted).toEqual([]);
	});

	it("should handle a more complex DAG", () => {
		const graph: Graph<number> = new Map([
			[5, [2, 0]],
			[4, [0, 1]],
			[2, [3]],
			[3, [1]],
			[0, []],
			[1, []],
		]);
		const sorted = topologicalSort(graph);
		expect(sorted).not.toBeNull();
		// Check dependencies
		expect(sorted!.indexOf(5)).toBeLessThan(sorted!.indexOf(2));
		expect(sorted!.indexOf(5)).toBeLessThan(sorted!.indexOf(0));
		expect(sorted!.indexOf(4)).toBeLessThan(sorted!.indexOf(0));
		expect(sorted!.indexOf(4)).toBeLessThan(sorted!.indexOf(1));
		expect(sorted!.indexOf(2)).toBeLessThan(sorted!.indexOf(3));
		expect(sorted!.indexOf(3)).toBeLessThan(sorted!.indexOf(1));
	});
});
