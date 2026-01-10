import { describe, expect, it } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
	it("should delay execution", async () => {
		const start = Date.now();
		await sleep(100);
		const duration = Date.now() - start;

		expect(duration).toBeGreaterThanOrEqual(90);
	});
});
