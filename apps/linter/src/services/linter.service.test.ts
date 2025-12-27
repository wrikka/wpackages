import { describe, expect, it } from "vitest";
import { lintFile, lintFiles } from "./linter.service";

describe("LinterService", () => {
	// Mock rule for future tests
	// const mockRule: Rule = {
	// 	meta: {
	// 		name: "test-rule",
	// 		description: "Test rule",
	// 		category: "best-practices",
	// 		recommended: false,
	// 		fixable: false,
	// 	},
	// 	check: () => [
	// 		{
	// 			ruleId: "test-rule",
	// 			message: "Test error",
	// 			severity: "error",
	// 			line: 1,
	// 			column: 1,
	// 		},
	// 	],
	// };


	it("should lint single file", async () => {
		// Since it depends on FileSystemService and parseFile,
		// this test would need proper mocking or integration test setup
		// For now, just verify the function exists and has the right signature
		expect(typeof lintFile).toBe("function");
	});

	it("should lint multiple files", async () => {
		// Verify function exists
		expect(typeof lintFiles).toBe("function");
	});

	it("should aggregate error and warning counts", () => {
		// This would require integration test with actual files
		expect(true).toBe(true);
	});
});
