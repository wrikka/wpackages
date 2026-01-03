import { describe, expect, it, vi } from "vitest";
import { batch, createEffect, createEffectScope, createMemo, createSignal, onCleanup, watch } from "./index";

describe("reactivity", () => {
	it("should create and update signals", () => {
		const [count, setCount] = createSignal(0);
		expect(count()).toBe(0);

		setCount(1);
		expect(count()).toBe(1);
	});

	it("should create memos", () => {
		const [count, setCount] = createSignal(0);
		const doubled = createMemo(() => count() * 2);

		expect(doubled()).toBe(0);

		setCount(2);
		expect(doubled()).toBe(4);
	});

	it("should run effects", () => {
		let effectRun = 0;
		const [count, setCount] = createSignal(0);

		createEffect(() => {
			count();
			effectRun++;
		});

		expect(effectRun).toBe(1);

		setCount(1);
		expect(effectRun).toBe(2);
	});

	it("should watch signals", () => {
		const [count, setCount] = createSignal(0);
		let watchedValue: number | undefined;

		watch(count, (newValue) => {
			watchedValue = newValue;
		}, { immediate: true });

		expect(watchedValue).toBe(0);

		setCount(5);
		expect(watchedValue).toBe(5);
	});

	it("should batch updates", () => {
		let effectRun = 0;
		const [count1, setCount1] = createSignal(0);
		const [count2, setCount2] = createSignal(0);

		createEffect(() => {
			count1();
			count2();
			effectRun++;
		});

		expect(effectRun).toBe(1);

		batch(() => {
			setCount1(1);
			setCount2(1);
		});

		expect(effectRun).toBe(2); // Should only run once despite two updates
	});

	it("should cleanup effects", () => {
		const [count, setCount] = createSignal(0);
		let effectRun = 0;

		const cleanup = createEffect(() => {
			count();
			effectRun++;
		});

		expect(effectRun).toBe(1);

		setCount(1);
		expect(effectRun).toBe(2);

		cleanup();

		setCount(2);
		expect(effectRun).toBe(2); // Should not run again after cleanup
	});

	it("should run onCleanup when an effect is cleaned up", () => {
		const cleanupFn = vi.fn();

		const cleanup = createEffect(() => {
			onCleanup(cleanupFn);
		});

		expect(cleanupFn).not.toHaveBeenCalled();

		cleanup();

		expect(cleanupFn).toHaveBeenCalledTimes(1);
	});

	it("should dispose effects within a scope", () => {
		const [count, setCount] = createSignal(0);
		let effectRun = 0;
		const scope = createEffectScope();

		scope.run(() => {
			createEffect(() => {
				count();
				effectRun++;
			});
		});

		expect(effectRun).toBe(1);

		setCount(1);
		expect(effectRun).toBe(2);

		scope.dispose();

		setCount(2);
		expect(effectRun).toBe(2); // Should not run again after dispose
	});
});
