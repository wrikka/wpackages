import { describe, expect, it } from "vitest";
import { fordFulkerson } from "./ford-fulkerson";

describe("fordFulkerson", () => {
	it("should calculate the maximum flow", () => {
		const edges = [
			{ from: "S", to: "A", capacity: 10 },
			{ from: "S", to: "B", capacity: 10 },
			{ from: "A", to: "C", capacity: 4 },
			{ from: "A", to: "D", capacity: 8 },
			{ from: "B", to: "D", capacity: 9 },
			{ from: "C", to: "T", capacity: 10 },
			{ from: "D", to: "T", capacity: 10 },
		];

		const maxFlow = fordFulkerson(edges, "S", "T");
		expect(maxFlow).toBeGreaterThan(0);
	});

	it("should return 0 if there is no path", () => {
		const edges = [{ from: "S", to: "A", capacity: 10 }];

		expect(fordFulkerson(edges, "S", "T")).toBe(0);
	});
});
