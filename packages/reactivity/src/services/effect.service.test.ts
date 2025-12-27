import { describe, expect, it, vi } from "vitest";
import { createSignal } from "../utils/signal.util";
import { createEffect, onCleanup } from "./effect.scope";

describe("onCleanup", () => {
	it("should run cleanup function when effect reruns", () => {
		const cleanupFn = vi.fn();
		const [signal, setSignal] = createSignal(0);

		createEffect(() => {
			signal(); // depend on signal
			onCleanup(cleanupFn);
		});

		expect(cleanupFn).not.toHaveBeenCalled();

		setSignal(1); // trigger rerun
		expect(cleanupFn).toHaveBeenCalledTimes(1);

		setSignal(2); // trigger rerun again
		expect(cleanupFn).toHaveBeenCalledTimes(2);
	});

	it("should run cleanup function when effect is disposed", () => {
		const cleanupFn = vi.fn();
		const dispose = createEffect(() => {
			onCleanup(cleanupFn);
		});

		expect(cleanupFn).not.toHaveBeenCalled();

		dispose();
		expect(cleanupFn).toHaveBeenCalledTimes(1);
	});
});
