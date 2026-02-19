import { describe, expect, it } from "vitest";
import { matrixChainMultiplication } from "./matrix-chain-multiplication";

describe("matrixChainMultiplication", () => {
	it("should find the minimum multiplication cost", () => {
		expect(matrixChainMultiplication([10, 30, 5, 60])).toBe(4500);
	});

	it("should handle two matrices", () => {
		expect(matrixChainMultiplication([10, 20, 30])).toBe(6000);
	});
});
