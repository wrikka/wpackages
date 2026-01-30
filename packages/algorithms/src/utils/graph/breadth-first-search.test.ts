import { describe, expect, it } from "vitest";
import { breadthFirstSearch } from "./breadth-first-search";

describe("breadthFirstSearch", () => {
	it("should find the shortest path between two nodes", () => {
		const graph = {
			A: ["B", "C"],
			B: ["A", "D", "E"],
			C: ["A", "F"],
			D: ["B"],
			E: ["B", "F"],
			F: ["C", "E"],
		};

		expect(breadthFirstSearch(graph, "A", "F")).toEqual(["A", "C", "F"]);
	});

	it("should return null if no path exists", () => {
		const graph = {
			A: ["B"],
			B: ["A"],
			C: ["D"],
			D: ["C"],
		};

		expect(breadthFirstSearch(graph, "A", "C")).toBeNull();
	});

	it("should return path with single node if start equals target", () => {
		const graph = {
			A: ["B"],
			B: ["A"],
		};

		expect(breadthFirstSearch(graph, "A", "A")).toEqual(["A"]);
	});
});
