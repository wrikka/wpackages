import { describe, expect, it } from "vitest";
import { kosaraju } from "./kosaraju";

describe("kosaraju", () => {
	it("should find all strongly connected components", () => {
		const graph = {
			A: ["B"],
			B: ["C"],
			C: ["A", "D"],
			D: ["E"],
			E: ["F"],
			F: ["D"],
		};

		const sccs = kosaraju(graph);
		expect(sccs.length).toBe(2);

		const flatSccs = sccs.flat().sort();
		expect(flatSccs).toEqual(["A", "B", "C", "D", "E", "F"]);
	});

	it("should handle a graph with no cycles", () => {
		const graph = {
			A: ["B"],
			B: ["C"],
			C: [],
		};

		const sccs = kosaraju(graph);
		expect(sccs.length).toBe(3);
	});
});
