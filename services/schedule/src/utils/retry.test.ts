import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import type { RetryConfig } from "../types/job";
import { calculateBackoffDelay, shouldRetry, withRetry } from "./retry";

describe("Retry Utils", () => {
	const fixedConfig: RetryConfig = {
		maxRetries: 3,
		backoffStrategy: "fixed",
		initialDelay: 1000,
		maxDelay: 10000,
		backoffMultiplier: 2,
	};

	const exponentialConfig: RetryConfig = {
		maxRetries: 3,
		backoffStrategy: "exponential",
		initialDelay: 1000,
		maxDelay: 10000,
		backoffMultiplier: 2,
	};

	const linearConfig: RetryConfig = {
		maxRetries: 3,
		backoffStrategy: "linear",
		initialDelay: 1000,
		maxDelay: 10000,
		backoffMultiplier: 2,
	};

	it("should calculate fixed backoff delay", () => {
		assert.strictEqual(calculateBackoffDelay(fixedConfig, 0), 1000);
		assert.strictEqual(calculateBackoffDelay(fixedConfig, 1), 1000);
		assert.strictEqual(calculateBackoffDelay(fixedConfig, 2), 1000);
	});

	it("should calculate exponential backoff delay", () => {
		assert.strictEqual(calculateBackoffDelay(exponentialConfig, 0), 1000);
		assert.strictEqual(calculateBackoffDelay(exponentialConfig, 1), 2000);
		assert.strictEqual(calculateBackoffDelay(exponentialConfig, 2), 4000);
		assert.strictEqual(calculateBackoffDelay(exponentialConfig, 3), 8000);
	});

	it("should cap exponential backoff at max delay", () => {
		assert.strictEqual(calculateBackoffDelay(exponentialConfig, 10), 10000);
	});

	it("should calculate linear backoff delay", () => {
		assert.strictEqual(calculateBackoffDelay(linearConfig, 0), 1000);
		assert.strictEqual(calculateBackoffDelay(linearConfig, 1), 2000);
		assert.strictEqual(calculateBackoffDelay(linearConfig, 2), 3000);
	});

	it("should retry failed effect", () =>
		Effect.gen(function* () {
			let attempts = 0;
			const failingEffect = Effect.gen(function* () {
				attempts++;
				if (attempts < 3) {
					return yield* Effect.fail(new Error("Not yet"));
				}
				return "success";
			});

			const result = yield* withRetry(failingEffect, exponentialConfig);
			assert.strictEqual(result, "success");
			assert.strictEqual(attempts, 3);
		}).pipe(Effect.runSync));

	it("should fail after max retries", () =>
		Effect.gen(function* () {
			const alwaysFailing = Effect.fail(new Error("Always fails"));

			const result = yield* Effect.flip(withRetry(alwaysFailing, fixedConfig));
			assert.strictEqual(result.message, "Always fails");
		}).pipe(Effect.runSync));

	it("should determine if should retry", () => {
		assert.strictEqual(shouldRetry(new Error("test"), fixedConfig), true);
		assert.strictEqual(
			shouldRetry(new Error("test"), { ...fixedConfig, maxRetries: 0 }),
			false,
		);
	});
});
