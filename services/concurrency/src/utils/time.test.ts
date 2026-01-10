import { describe, expect, it } from "vitest";

import { delay, isExpired, now } from "./time";

describe("time", () => {
	it("now returns a number", () => {
		expect(typeof now()).toBe("number");
	});

	it("isExpired returns false for fresh timestamps", () => {
		const ts = now();
		expect(isExpired(ts, 10_000)).toBe(false);
	});

	it("delay resolves", async () => {
		await expect(delay(0)).resolves.toBeUndefined();
	});
});
