import { describe, expect, it, vi } from "vitest";
import { createEffect } from "./effect.scope";
import { reactive } from "./reactive.service";

describe("reactive", () => {
	it("should make a simple object reactive", () => {
		const state = reactive({ count: 0 });
		let dummy: any;

		createEffect(() => {
			dummy = state.count;
		});

		expect(dummy).toBe(0);

		state.count = 1;
		expect(dummy).toBe(1);
	});

	it("should handle nested objects", () => {
		const state = reactive({ nested: { count: 0 } });
		let dummy: any;

		createEffect(() => {
			dummy = state.nested.count;
		});

		expect(dummy).toBe(0);

		state.nested.count = 1;
		expect(dummy).toBe(1);
	});

	it("should not trigger effects if value is unchanged", () => {
		const state = reactive({ count: 0 });
		const effectFn = vi.fn(() => state.count);

		createEffect(effectFn);

		expect(effectFn).toHaveBeenCalledTimes(1);

		state.count = 0; // Set to the same value
		expect(effectFn).toHaveBeenCalledTimes(1);

		state.count = 1;
		expect(effectFn).toHaveBeenCalledTimes(2);
	});
});
