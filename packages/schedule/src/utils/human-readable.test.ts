import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { parseHumanReadable, toHumanReadable } from "./human-readable";

describe("Human Readable Scheduler", () => {
	it("should parse 'every minute'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("every minute");
			assert.strictEqual(result, "* * * * *");
		}).pipe(Effect.runSync));

	it("should parse 'every 5 minutes'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("every 5 minutes");
			assert.strictEqual(result, "*/5 * * * *");
		}).pipe(Effect.runSync));

	it("should parse 'every hour'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("every hour");
			assert.strictEqual(result, "0 * * * *");
		}).pipe(Effect.runSync));

	it("should parse 'every day'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("every day");
			assert.strictEqual(result, "0 0 * * *");
		}).pipe(Effect.runSync));

	it("should parse 'daily at 9:30'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("daily at 9:30");
			assert.strictEqual(result, "30 9 * * *");
		}).pipe(Effect.runSync));

	it("should parse 'weekly on monday at 9:30'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("weekly on monday at 9:30");
			assert.strictEqual(result, "30 9 * * 1");
		}).pipe(Effect.runSync));

	it("should parse 'monthly on day 15 at 9:30'", () =>
		Effect.gen(function* () {
			const result = yield* parseHumanReadable("monthly on day 15 at 9:30");
			assert.strictEqual(result, "30 9 15 * *");
		}).pipe(Effect.runSync));

	it("should fail on invalid input", () =>
		Effect.gen(function* () {
			const result = yield* Effect.flip(parseHumanReadable("invalid schedule"));
			assert.ok(result.reason.includes("Invalid human-readable schedule"));
		}).pipe(Effect.runSync));

	it("should convert cron to human readable", () => {
		assert.strictEqual(toHumanReadable("* * * * *"), "Every minute");
		assert.strictEqual(toHumanReadable("0 * * * *"), "Every hour");
		assert.strictEqual(toHumanReadable("0 0 * * *"), "Every day at midnight");
		assert.strictEqual(toHumanReadable("*/5 * * * *"), "Every 5 minutes");
		assert.strictEqual(toHumanReadable("30 9 * * *"), "Daily at 9:30");
	});

	it("should return original cron for complex expressions", () => {
		assert.strictEqual(toHumanReadable("0 9,17 * * 1-5"), "0 9,17 * * 1-5");
	});
});
