import { describe, expect, it } from "vitest";

import { sleep } from "./sleep";

describe("sleep", () => {
	it("resolves", async () => {
		await expect(sleep(0)).resolves.toBeUndefined();
	});

	it("rejects for negative ms", async () => {
		await expect(sleep(-1)).rejects.toBeInstanceOf(RangeError);
	});

	it("rejects on abort", async () => {
		const controller = new AbortController();
		const p = sleep(1000, { signal: controller.signal });
		controller.abort(new Error("aborted"));
		await expect(p).rejects.toThrow("aborted");
	});
});
