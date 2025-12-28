import { describe, expect, it } from "vitest";

import { TimeoutError, withTimeout } from "./timeout";

describe("withTimeout", () => {
	it("resolves when promise resolves in time", async () => {
		await expect(withTimeout(Promise.resolve(1), 10)).resolves.toBe(1);
	});

	it("rejects with TimeoutError when timed out", async () => {
		const p = new Promise<void>(() => {
			// never resolves
		});
		await expect(withTimeout(p, 0)).rejects.toBeInstanceOf(TimeoutError);
	});
});
