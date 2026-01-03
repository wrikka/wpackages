import type { Span, SpanContext, SpanEvent, SpanStatus, Tracer } from "./types";

class SpanImpl implements Span {
	readonly name: string;
	readonly context: SpanContext;
	readonly parentId: SpanContext["spanId"] | undefined;
	readonly startTime: number;

	endTime?: number;
	status: SpanStatus = "unset";
	attributes: Record<string, unknown> = {};
	events: SpanEvent[] = [];

	constructor(name: string, context: SpanContext, parentId?: SpanId) {
		this.name = name;
		this.context = context;
		this.parentId = parentId;
		this.startTime = Date.now();
	}

	end(endTime?: number): void {
		this.endTime = endTime ?? Date.now();
	}

	setStatus(status: SpanStatus): this {
		this.status = status;
		return this;
	}

	setAttribute(key: string, value: unknown): this {
		this.attributes[key] = value;
		return this;
	}

	addEvent(name: string, attributes?: Record<string, unknown>): this {
		this.events.push({ name, attributes, time: Date.now() });
		return this;
	}
}

export class TracerImpl implements Tracer {
	startSpan(name: string, parent?: SpanContext): Span {
		const traceId = parent?.traceId ?? crypto.randomUUID();
		const spanId = crypto.randomUUID();
		const context = { traceId, spanId };
		return new SpanImpl(name, context, parent?.spanId);
	}
}

class NoopSpan implements Span {
	readonly name: string;
	readonly context: SpanContext;
	readonly parentId: SpanContext["spanId"] | undefined;
	readonly startTime: number = 0;

	constructor(name: string, context: SpanContext, parentId?: SpanId) {
		this.name = name;
		this.context = context;
		this.parentId = parentId;
	}

	end(_endTime?: number): void {}

	setStatus(_status: SpanStatus): this {
		return this;
	}

	setAttribute(_key: string, _value: unknown): this {
		return this;
	}

	addEvent(_name: string, _attributes?: Record<string, unknown>): this {
		return this;
	}
}

export const NOOP_TRACER: Tracer = {
	startSpan: (name: string, parent?: SpanContext) => {
		const context = parent ?? { traceId: "", spanId: "" };
		return new NoopSpan(name, context, parent?.spanId);
	},
};
