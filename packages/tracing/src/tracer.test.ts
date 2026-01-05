import { describe, expect, it } from "vitest";
import { getActiveSpan, withActiveSpan } from "./context";
import { NOOP_TRACER, TracerImpl } from "./tracer";

describe("TracerImpl", () => {
	it("should create a root span", () => {
		const tracer = new TracerImpl();
		const span = tracer.startSpan("root");
		expect(span.name).toBe("root");
		expect(span.parentId).toBeUndefined();
		expect(span.context.traceId).toBeDefined();
		expect(span.context.spanId).toBeDefined();
	});

	it("should create a child span using active context", () => {
		const tracer = new TracerImpl();
		const rootSpan = tracer.startSpan("root");

		withActiveSpan(rootSpan, () => {
			const childSpan = tracer.startSpan("child");
			expect(childSpan.name).toBe("child");
			expect(childSpan.parentId).toBe(rootSpan.context.spanId);
			expect(childSpan.context.traceId).toBe(rootSpan.context.traceId);
		});
	});

	it("should set status", () => {
		const tracer = new TracerImpl();
		const span = tracer.startSpan("root");
		span.setStatus("ok");
		expect(span.status).toBe("ok");
	});

	it("should set attribute", () => {
		const tracer = new TracerImpl();
		const span = tracer.startSpan("root");
		span.setAttribute("key", "value");
		expect(span.attributes["key"]).toBe("value");
	});

	it("should add event", () => {
		const tracer = new TracerImpl();
		const span = tracer.startSpan("root");
		span.addEvent("event");
		expect(span.events).toHaveLength(1);
		expect(span.events[0].name).toBe("event");
	});

	it("should end span", () => {
		const tracer = new TracerImpl();
		const span = tracer.startSpan("root");
		span.end();
		expect(span.endTime).toBeDefined();
	});

	describe("trace method", () => {
		it("should create a span and end it after execution", async () => {
			const tracer = new TracerImpl();
			let capturedSpan;
			const result = await tracer.trace("test-trace", (span) => {
				capturedSpan = span;
				expect(span.name).toBe("test-trace");
				expect(span.endTime).toBeUndefined();
				return 42;
			});

			expect(result).toBe(42);
			expect(capturedSpan).toBeDefined();
			expect(capturedSpan.endTime).toBeDefined();
		});

		it("should correctly propagate context", async () => {
			const tracer = new TracerImpl();
			await tracer.trace("parent", (parentSpan) => {
				expect(getActiveSpan()).toBe(parentSpan);
				const childSpan = tracer.startSpan("child");
				expect(childSpan.parentId).toBe(parentSpan.context.spanId);
			});
		});

		it("should handle errors and set span status", async () => {
			const tracer = new TracerImpl();
			let capturedSpan;
			await expect(
				tracer.trace("error-trace", (span) => {
					capturedSpan = span;
					throw new Error("test error");
				}),
			).rejects.toThrow("test error");

			expect(capturedSpan).toBeDefined();
			expect(capturedSpan.status).toBe("error");
			expect(capturedSpan.attributes["error.message"]).toBe("test error");
			expect(capturedSpan.endTime).toBeDefined();
		});
	});
});

describe("NOOP_TRACER", () => {
	it("should return a no-op span", () => {
		const span = NOOP_TRACER.startSpan("root");
		expect(span.name).toBe("root");
		expect(span.context).toEqual({ traceId: "", spanId: "" });
		span.setStatus("ok");
		span.setAttribute("key", "value");
		span.addEvent("event");
		span.end();
	});
});
