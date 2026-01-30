import { describe, expect, it } from "vitest";
import { findArticulationPoints } from "./articulation-points";

describe("findArticulationPoints", () => {
	it("should find all articulation points in a graph", () => {
		const graph = {
			A: ["B", "C"],
			B: ["A", "D", "E"],
			C: ["A", "F"],
			D: ["B"],
			E: ["B", "F"],
			F: ["C", "E"],
		};

		const articulationPoints = findArticulationPoints(graph);
		expect(articulationPoints).toContain("A");
		expect(articulationPoints).toContain("B");
	});

	it("should return empty array for a complete graph", () => {
		const graph = {
			A: ["B", "C"],
			B: ["A", "C"],
			C: ["A", "B"],
		};

		expect(findArticulationPoints(graph)).toEqual([]);
	});
});
