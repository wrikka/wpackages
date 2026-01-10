import { describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
	it("should delay function execution", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced(1);
		debounced(2);
		debounced(3);

		expect(fn).not.toHaveBeenCalled();

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(3);
	});

	it("should cancel previous calls", async () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced(1);
		await new Promise((resolve) => setTimeout(resolve, 50));
		debounced(2);
		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(2);
	});
});
