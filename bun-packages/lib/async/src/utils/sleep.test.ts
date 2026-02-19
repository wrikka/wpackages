import { describe, expect, it } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
	it("should resolve after specified time", async () => {
		const start = Date.now();
		await sleep(50);
		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(40);
	});

	it("should reject for negative ms", async () => {
		await expect(sleep(-1)).rejects.toThrow(RangeError);
	});

	it("should reject when aborted before sleep", async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(sleep(100, { signal: controller.signal })).rejects.toThrow();
	});

	it("should reject when aborted during sleep", async () => {
		const controller = new AbortController();
		const promise = sleep(1000, { signal: controller.signal });
		setTimeout(() => controller.abort(), 10);
		await expect(promise).rejects.toThrow();
	});
});
