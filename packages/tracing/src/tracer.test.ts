import { describe, it, expect } from "vitest";
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

	it("should create a child span", () => {
		const tracer = new TracerImpl();
		const rootSpan = tracer.startSpan("root");
		const childSpan = tracer.startSpan("child", rootSpan.context);

		expect(childSpan.name).toBe("child");
		expect(childSpan.parentId).toBe(rootSpan.context.spanId);
		expect(childSpan.context.traceId).toBe(rootSpan.context.traceId);
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
