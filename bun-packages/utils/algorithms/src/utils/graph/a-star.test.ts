import { describe, expect, it } from "vitest";
import { aStar } from "./a-star";

describe("aStar", () => {
	it("should find the optimal path between two nodes", () => {
		const nodes = [
			{ id: "A", x: 0, y: 0 },
			{ id: "B", x: 1, y: 0 },
			{ id: "C", x: 0, y: 1 },
			{ id: "D", x: 1, y: 1 },
		];

		const edges = [
			{ from: "A", to: "B", weight: 1 },
			{ from: "A", to: "C", weight: 1 },
			{ from: "B", to: "D", weight: 1 },
			{ from: "C", to: "D", weight: 1 },
		];

		const path = aStar(nodes, edges, "A", "D");
		expect(path).toBeTruthy();
		expect(path![0]).toBe("A");
		expect(path![path!.length - 1]).toBe("D");
	});

	it("should return null if no path exists", () => {
		const nodes = [
			{ id: "A", x: 0, y: 0 },
			{ id: "B", x: 1, y: 0 },
			{ id: "C", x: 2, y: 0 },
		];

		const edges = [{ from: "A", to: "B", weight: 1 }];

		expect(aStar(nodes, edges, "A", "C")).toBeNull();
	});
});
