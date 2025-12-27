import { describe, expect, it, vi } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
	it("should limit function calls", async () => {
		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled(1);
		throttled(2);
		throttled(3);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(1);

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("should execute immediately on first call", () => {
		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled(1);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(1);
	});
});
