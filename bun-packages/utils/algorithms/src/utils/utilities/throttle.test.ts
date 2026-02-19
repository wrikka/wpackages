import { describe, expect, it, vi, beforeEach } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should limit function calls", () => {
		const fn = vi.fn();
		const throttledFn = throttle(fn, 300);

		throttledFn("call1");
		throttledFn("call2");
		throttledFn("call3");

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("call1");

		vi.advanceTimersByTime(300);

		throttledFn("call4");

		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenCalledWith("call4");
	});
});
