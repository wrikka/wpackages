import { describe, expect, it, vi } from "vitest";
import { createDebouncer, createThrottler } from "./debounce";

vi.useFakeTimers();

describe("createDebouncer", () => {
	it("should call the function after the specified delay", () => {
		const func = vi.fn();
		const debouncedFunc = createDebouncer(func, 500);

		debouncedFunc();
		expect(func).not.toHaveBeenCalled();

		vi.advanceTimersByTime(500);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it("should reset the timer if called again before the delay has passed", () => {
		const func = vi.fn();
		const debouncedFunc = createDebouncer(func, 500);

		debouncedFunc();
		vi.advanceTimersByTime(250);
		debouncedFunc();

		vi.advanceTimersByTime(250);
		expect(func).not.toHaveBeenCalled();

		vi.advanceTimersByTime(250);
		expect(func).toHaveBeenCalledTimes(1);
	});
});

describe("createThrottler", () => {
	it("should call the function immediately on the first call", () => {
		const func = vi.fn();
		const throttledFunc = createThrottler(func, 500);

		throttledFunc();
		expect(func).toHaveBeenCalledTimes(1);
	});

	it("should not call the function again if called within the delay period", () => {
		const func = vi.fn();
		const throttledFunc = createThrottler(func, 500);

		throttledFunc();
		throttledFunc();
		throttledFunc();

		expect(func).toHaveBeenCalledTimes(1);
	});

	it("should call the function again after the delay has passed", () => {
		const func = vi.fn();
		const throttledFunc = createThrottler(func, 500);

		throttledFunc();
		expect(func).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(500);

		throttledFunc();
		expect(func).toHaveBeenCalledTimes(2);
	});
});
