export type SpanId = string;
export type TraceId = string;

export interface SpanContext {
	traceId: TraceId;
	spanId: SpanId;
}

export type SpanStatus = 'ok' | 'error' | 'unset';

export type SpanEvent = {
	name: string;
	time: number;
	attributes?: Record<string, unknown>;
};

export interface Span {
	readonly context: SpanContext;
	readonly parentId: SpanId | undefined;
	readonly name: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly status: SpanStatus;
	readonly attributes: Record<string, unknown>;
	readonly events: SpanEvent[];

	end: (endTime?: number) => void;
	setStatus: (status: SpanStatus) => this;
	setAttribute: (key: string, value: unknown) => this;
	addEvent: (name: string, attributes?: Record<string, unknown>) => this;
}

export interface Tracer {
	startSpan: (name: string, parent?: SpanContext) => Span;
}
