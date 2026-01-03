import { describe, expect, it, vi } from "vitest";
import { createSignal } from "../utils/signal.util";
import { createEffect } from "./effect.scope";
import { on } from "./watch.service";

describe("on", () => {
	it("should only track the specified dependency", () => {
		const [a, setA] = createSignal(0);
		const [b, setB] = createSignal(0);
		const callback = vi.fn(() => {
			// Access b, but it should not be tracked
			b();
		});

		// The effect should only track 'a'
		createEffect(on(a, callback));

		expect(callback).toHaveBeenCalledTimes(1);

		// Changing 'b' should not trigger the effect
		setB(1);
		expect(callback).toHaveBeenCalledTimes(1);

		// Changing 'a' should trigger the effect
		setA(1);
		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("should pass the current and previous value to the callback", () => {
		const [count, setCount] = createSignal(1);
		let currentValue: number | undefined;
		let prevValue: number | undefined;

		createEffect(on(count, (v, p) => {
			currentValue = v;
			prevValue = p;
		}));

		// Initial run
		expect(currentValue).toBe(1);
		expect(prevValue).toBe(undefined);

		// Update
		setCount(2);
		expect(currentValue).toBe(2);
		expect(prevValue).toBe(1);
	});
});
