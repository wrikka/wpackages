import { describe, expect, it } from "vitest";
import { HyperLogLog } from "./hyper-log-log";

describe("HyperLogLog", () => {
	it("should estimate cardinality", () => {
		const hll = new HyperLogLog();
		const data = ["a", "b", "c", "a", "b", "d"];
		data.forEach((item) => hll.add(item));
		const estimate = hll.count();
		expect(estimate).toBeGreaterThan(0);
	});

	it("should handle empty data", () => {
		const hll = new HyperLogLog();
		expect(hll.count()).toBe(0);
	});
});
