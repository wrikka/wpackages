import { describe, expect, it } from "vitest";
import { defer } from "./defer";

describe("defer", () => {
	it("should create a deferred promise", async () => {
		const d = defer<number>();
		expect(d.promise).toBeInstanceOf(Promise);
		expect(typeof d.resolve).toBe("function");
		expect(typeof d.reject).toBe("function");
	});

	it("should resolve the promise", async () => {
		const d = defer<number>();
		d.resolve(42);
		await expect(d.promise).resolves.toBe(42);
	});

	it("should reject the promise", async () => {
		const d = defer<number>();
		d.reject(new Error("test error"));
		await expect(d.promise).rejects.toThrow("test error");
	});
});
