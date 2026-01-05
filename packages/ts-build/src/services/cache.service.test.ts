import { describe, it, expect } from "@wpackages/test";
import { computeBuildHash } from "./cache.service";

describe("computeBuildHash", () => {
	it("returns stable hash for same config", async () => {
		const config = {
			entry: ["src/index.ts"],
			outDir: ".output",
			format: ["esm"],
			target: "bun",
		} as any;

		const h1 = await computeBuildHash(process.cwd(), config);
		const h2 = await computeBuildHash(process.cwd(), config);
		expect(h1).toBe(h2);
	});
});
