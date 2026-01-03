import { describe, expect, it } from "vitest";
import { sleep } from "./sleep";
import { timeout } from "./timeout";

describe("timeout", () => {
	it("should resolve if promise completes in time", async () => {
		const promise = sleep(50).then(() => "done");
		const result = await timeout(promise, 100);
		expect(result).toBe("done");
	});

	it("should reject on timeout", async () => {
		const promise = sleep(200).then(() => "done");
		await expect(timeout(promise, 100)).rejects.toThrow("Timeout");
	});
});
