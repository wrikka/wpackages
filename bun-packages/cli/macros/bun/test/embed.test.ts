import { describe, expect, it } from "vitest";
import { embed } from "./mocks/embed";

describe("embed", () => {
	it("should embed file content", () => {
		const content = embed("./test-data/test.txt");
		expect(content).toBeDefined();
	});

	it("should throw error for non-existent file", () => {
		expect(() => embed("./non-existent.txt")).toThrow("Failed to read file");
	});
});
