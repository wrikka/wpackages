import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorTracker } from "./error-tracker";

describe("ErrorTracker", () => {
	let tracker: ErrorTracker;
	let onErrorCallback: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onErrorCallback = vi.fn();
		tracker = new ErrorTracker({
			onError: onErrorCallback,
		});
	});

	afterEach(() => {
		tracker.stop();
	});

	it("should create error tracker", () => {
		expect(tracker).toBeDefined();
	});

	it("should capture error manually", () => {
		const error = new Error("Test error");
		tracker.captureError(error);

		expect(onErrorCallback).toHaveBeenCalledTimes(1);
		const context = onErrorCallback.mock.calls[0][0];
		expect(context.message).toBe("Test error");
	});

	it("should capture error with additional context", () => {
		const error = new Error("Test error");
		tracker.captureError(error, { userId: "123" });

		expect(onErrorCallback).toHaveBeenCalledTimes(1);
		const context = onErrorCallback.mock.calls[0][0];
		expect(context.additional).toEqual({ userId: "123" });
	});

	it("should create error context from Error object", () => {
		const error = new Error("Test error");
		error.name = "CustomError";
		const context = tracker.createErrorContext(error);

		expect(context.type).toBe("Error");
		expect(context.message).toBe("Test error");
		expect(context.name).toBe("CustomError");
		expect(context.stack).toBeDefined();
	});

	it("should create error context from string", () => {
		const context = tracker.createErrorContext("String error");

		expect(context.type).toBe("String");
		expect(context.message).toBe("String error");
	});

	it("should create error context from unknown type", () => {
		const context = tracker.createErrorContext(12345);

		expect(context.type).toBe("Unknown");
		expect(context.message).toBe("12345");
	});

	it("should include timestamp in error context", () => {
		const before = Date.now();
		const context = tracker.createErrorContext(new Error("Test"));
		const after = Date.now();

		expect(context.timestamp).toBeGreaterThanOrEqual(before);
		expect(context.timestamp).toBeLessThanOrEqual(after);
	});
});
