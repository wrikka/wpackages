import { describe, expect, it, vi, beforeEach } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should delay function execution", () => {
		const fn = vi.fn();
		const debouncedFn = debounce(fn, 300);

		debouncedFn("call1");
		debouncedFn("call2");

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("call2");
	});
});
