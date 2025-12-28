import { describe, expect, it, vi } from "vitest";
import { Effect, Layer, left, right } from ".";

describe("Effect System", () => {
	it("succeed should resolve with the value", async () => {
		const effect = Effect.succeed(42);
		await expect(Effect.runPromiseEither(effect)).resolves.toEqual({ _tag: "Right", right: 42 });
	});

	it("fromPromise should resolve with the promise's value", async () => {
		const effect = Effect.fromPromise(() => Promise.resolve("hello"));
		await expect(Effect.runPromiseEither(effect)).resolves.toEqual({ _tag: "Right", right: "hello" });
	});

	it("flatMap should chain effects correctly", async () => {
		const effect = Effect.succeed(10);
		const chained = Effect.flatMap(effect, (n) => Effect.succeed(n * 2));
		await expect(Effect.runPromiseEither(chained)).resolves.toEqual({ _tag: "Right", right: 20 });
	});

	describe("Context and Layers", () => {
		const Service1 = Effect.tag<number>("Service1");
		const Service2 = Effect.tag<string>("Service2");

		it("get should retrieve a service from the context", async () => {
			const effect = Effect.get(Service1);
			const layer = Layer.succeed(Service1, 123);
			const program = Effect.provideLayer(effect, layer);
			await expect(Effect.runPromiseEither(program)).resolves.toEqual({ _tag: "Right", right: 123 });
		});

		it("get should reject if service is not found", async () => {
			const effect = Effect.get(Service1);
			await expect(Effect.runPromiseEither(effect, {} as any)).resolves.toEqual(
				expect.objectContaining({
					_tag: "Left",
					left: expect.any(Error),
				}),
			);
			const result = await Effect.runPromiseEither(effect, {} as any) as { _tag: "Left"; left: Error };
			expect(result.left.message).toBe("Service for tag not found in context");
		});

		it("Layer.merge should combine two layers", async () => {
			const effect = Effect.gen(function*() {
				const s1 = yield Effect.get(Service1);
				const s2 = yield Effect.get(Service2);
				return `${s2}: ${s1}`;
			});

			const layer1 = Layer.succeed(Service1, 42);
			const layer2 = Layer.succeed(Service2, "the answer is");
			const mergedLayer = Layer.merge(layer1, layer2);

			const program = Effect.provideLayer(effect, mergedLayer);
			await expect(Effect.runPromiseEither(program)).resolves.toEqual({ _tag: "Right", right: "the answer is: 42" });
		});
	});

	it("gen should work with generators", async () => {
		const effect = Effect.gen(function*() {
			const a = yield Effect.succeed(1);
			const b = yield Effect.fromPromise(() => Promise.resolve(2));
			return a + b;
		});
		await expect(Effect.runPromiseEither(effect)).resolves.toEqual({ _tag: "Right", right: 3 });
	});

	it("mapError should transform the error channel", async () => {
		const effect = Effect.fail("error");
		const mapped = Effect.mapError(effect, (e) => `mapped ${e}`);
		await expect(Effect.runPromiseEither(mapped)).resolves.toEqual(left("mapped error"));
	});

	it("tap should perform a side effect without changing the value", async () => {
		const spy = vi.fn();
		const effect = Effect.succeed(42);
		const tapped = Effect.tap(effect, spy);
		await expect(Effect.runPromiseEither(tapped)).resolves.toEqual(right(42));
		expect(spy).toHaveBeenCalledWith(42);
	});

	it("tapError should perform a side effect on failure", async () => {
		const spy = vi.fn();
		const effect = Effect.fail("error");
		const tapped = Effect.tapError(effect, spy);
		await expect(Effect.runPromiseEither(tapped)).resolves.toEqual(left("error"));
		expect(spy).toHaveBeenCalledWith("error");
	});

	it("match should handle both success and failure cases", async () => {
		const successEffect = Effect.succeed(10);
		const failureEffect = Effect.fail("failure");

		const matcher = {
			onSuccess: (n: number) => `Success: ${n}`,
			onFailure: (e: string) => `Failure: ${e}`,
		};

		const matchedSuccess = Effect.match(successEffect, matcher);
		const matchedFailure = Effect.match(failureEffect, matcher);

		await expect(Effect.runPromiseEither(matchedSuccess)).resolves.toEqual(right("Success: 10"));
		await expect(Effect.runPromiseEither(matchedFailure)).resolves.toEqual(right("Failure: failure"));
	});
});
