import { describe, expect, it } from "vitest";

import { defer } from "./defer";

describe("defer", () => {
	it("resolves later", async () => {
		const d = defer<number>();
		d.resolve(123);
		await expect(d.promise).resolves.toBe(123);
	});

	it("rejects later", async () => {
		const d = defer<number>();
		d.reject(new Error("boom"));
		await expect(d.promise).rejects.toThrow("boom");
	});
});
