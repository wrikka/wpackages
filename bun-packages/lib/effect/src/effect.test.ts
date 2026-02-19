import { describe, expect, it } from "bun:test";
import { fail, gen, runPromise, succeed, sync, tryPromise } from "./";

describe("Effect", () => {
	it("should succeed with a value", async () => {
		const effect = succeed(42);
		const result = await runPromise(effect);
		expect(result).toEqual({ _tag: "Success", value: 42 });
	});

	it("should fail with an error", async () => {
		const effect = fail({ message: "Error" });
		const result = await runPromise(effect);
		expect(result).toEqual({ _tag: "Failure", error: { message: "Error" } });
	});

	it("should run sync effect", async () => {
		const effect = sync(() => 42);
		const result = await runPromise(effect);
		expect(result).toEqual({ _tag: "Success", value: 42 });
	});

	it("should run async effect", async () => {
		const effect = tryPromise(
			() => Promise.resolve(42),
			(e) => ({ message: String(e) }),
		);
		const result = await runPromise(effect);
		expect(result).toEqual({ _tag: "Success", value: 42 });
	});

	it("should handle async error", async () => {
		const effect = tryPromise(
			() => Promise.reject(new Error("Failed")),
			(e) => ({ message: String(e) }),
		);
		const result = await runPromise(effect);
		expect(result).toEqual({
			_tag: "Failure",
			error: { message: "Error: Failed" },
		});
	});

	it("should work with gen", async () => {
		const effect = gen(function*() {
			const a = yield* succeed(1);
			const b = yield* succeed(2);
			return succeed(a + b);
		});
		const result = await runPromise(effect);
		expect(result).toEqual({ _tag: "Success", value: 3 });
	});
});
