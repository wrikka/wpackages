import { describe, expect, it } from "bun:test";
import { batch, effect, signal, untrack } from "../src/index";

describe("palse advanced features", () => {
	it("untrack should prevent dependency tracking", () => {
		const tracked = signal(0);
		const untrackedSignal = signal(10);
		const seen: number[] = [];

		effect(() => {
			const currentTracked = tracked.get();
			const currentUntracked = untrack(() => untrackedSignal.get());
			seen.push(currentTracked + currentUntracked);
			return undefined;
		});

		// seen should be [10] initially (0 + 10)

		tracked.set(1);
		// effect should run, seen: [10, 11] (1 + 10)

		untrackedSignal.set(20);
		// effect should NOT run, because untrackedSignal is not a dependency

		tracked.set(2);
		// effect should run, seen: [10, 11, 22] (2 + 20)

		expect(seen).toEqual([10, 11, 22]);
	});

	it("batch should group multiple updates into one effect run", () => {
		const a = signal(1);
		const b = signal(2);
		let effectRuns = 0;

		effect(() => {
			// just read the values to create dependency
			a.get();
			b.get();
			effectRuns++;
			return undefined;
		});

		// effectRuns should be 1 initially

		batch(() => {
			a.set(5);
			expect(a.get()).toBe(5); // value should be updated immediately within the batch
			b.set(10);
			expect(b.get()).toBe(10);
		});

		// effect should have run only once more after the batch
		expect(effectRuns).toBe(2);
	});
});
