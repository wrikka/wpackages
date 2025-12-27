import { describe, expect, it } from "vitest";
import { generateContainerId, generateContainerName, mergeResourceLimits } from "./container";

describe("container utils", () => {
	describe("generateContainerId", () => {
		it("should generate a valid UUID", () => {
			const id = generateContainerId();
			expect(id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
			);
		});

		it("should generate unique IDs", () => {
			const id1 = generateContainerId();
			const id2 = generateContainerId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("generateContainerName", () => {
		it("should generate a name with default prefix", () => {
			const name = generateContainerName();
			expect(name).toMatch(/^container-\d+$/);
		});

		it("should generate a name with custom prefix", () => {
			const name = generateContainerName("test");
			expect(name).toMatch(/^test-\d+$/);
		});
	});

	describe("mergeResourceLimits", () => {
		it("should use default timeout when not provided", () => {
			const limits = mergeResourceLimits();
			expect(limits.timeout).toBe(60000);
		});

		it("should merge custom timeout", () => {
			const limits = mergeResourceLimits({ timeout: 30000 });
			expect(limits.timeout).toBe(30000);
		});

		it("should include maxMemory if provided", () => {
			const limits = mergeResourceLimits({ maxMemory: 512 });
			expect(limits).toHaveProperty("maxMemory", 512);
		});

		it("should include maxCpu if provided", () => {
			const limits = mergeResourceLimits({ maxCpu: 50 });
			expect(limits).toHaveProperty("maxCpu", 50);
		});
	});
});
