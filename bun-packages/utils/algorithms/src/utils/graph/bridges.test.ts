import { describe, expect, it } from "vitest";
import { findBridges } from "./bridges";

describe("findBridges", () => {
	it("should find all bridges in a graph", () => {
		const graph = {
			A: ["B", "C"],
			B: ["A", "D"],
			C: ["A", "D"],
			D: ["B", "C", "E"],
			E: ["D"],
		};

		const bridges = findBridges(graph);
		expect(bridges.length).toBeGreaterThan(0);
	});

	it("should return empty array for a graph with no bridges", () => {
		const graph = {
			A: ["B", "C"],
			B: ["A", "C"],
			C: ["A", "B"],
		};

		expect(findBridges(graph)).toEqual([]);
	});
});
