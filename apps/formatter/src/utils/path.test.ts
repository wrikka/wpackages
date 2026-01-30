import { describe, it, expect } from "vitest";
import { findUp } from "./path";

describe("findUp", () => {
	it("should find package.json in current directory", () => {
		const result = findUp(process.cwd(), ["package.json"]);
		expect(result).not.toBeNull();
		expect(result?.endsWith("package.json")).toBe(true);
	});

	it("should return null for non-existent file", () => {
		const result = findUp(process.cwd(), ["non-existent-file.xyz"]);
		expect(result).toBeNull();
	});
});
