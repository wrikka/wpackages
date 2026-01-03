import { describe, expect, it, vi } from "vitest";
import { createCancellationTokenSource, withCancellation } from "./cancellationToken";

describe("CancellationToken", () => {
	it("should create a cancellable token source", () => {
		const source = createCancellationTokenSource();

		expect(source.token).toBeDefined();
		expect(source.token.isCancelled).toBeTypeOf("function");
		expect(source.token.throwIfCancelled).toBeTypeOf("function");
		expect(source.token.onCancelled).toBeTypeOf("function");
		expect(source.cancel).toBeTypeOf("function");

		expect(source.token.isCancelled()).toBe(false);
	});

	it("should cancel correctly", () => {
		const source = createCancellationTokenSource();

		expect(source.token.isCancelled()).toBe(false);

		source.cancel();

		expect(source.token.isCancelled()).toBe(true);
	});

	it("should throw when cancelled", () => {
		const source = createCancellationTokenSource();
		source.cancel();

		expect(() => source.token.throwIfCancelled()).toThrow("Operation was cancelled");
	});

	it("should call callbacks when cancelled", () => {
		const source = createCancellationTokenSource();
		const callback = vi.fn();

		source.token.onCancelled(callback);
		expect(callback).not.toHaveBeenCalled();

		source.cancel();
		expect(callback).toHaveBeenCalled();
	});

	it("should call callbacks immediately if already cancelled", () => {
		const source = createCancellationTokenSource();
		const callback = vi.fn();

		source.cancel();
		source.token.onCancelled(callback);

		expect(callback).toHaveBeenCalled();
	});

	it("should work with withCancellation helper", async () => {
		const source = createCancellationTokenSource();

		const promise = new Promise<string>((resolve) => {
			setTimeout(() => resolve("success"), 100);
		});

		const cancellablePromise = withCancellation(promise, source.token);

		// Cancel before promise resolves
		setTimeout(() => source.cancel(), 50);

		await expect(cancellablePromise).rejects.toThrow("Operation was cancelled");
	});

	it("should resolve normally if not cancelled", async () => {
		const source = createCancellationTokenSource();

		const promise = Promise.resolve("success");
		const cancellablePromise = withCancellation(promise, source.token);

		const result = await cancellablePromise;
		expect(result).toBe("success");
	});
});
