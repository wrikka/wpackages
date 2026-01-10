export interface Span {
	readonly id: string;
	readonly traceId: string;
	readonly parentId?: string;
	readonly name: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly tags: Record<string, string>;
	readonly events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>;
	end(): void;
	addEvent(name: string, attributes?: Record<string, unknown>): void;
	setTag(key: string, value: string): void;
}

export interface Tracer {
	startSpan(name: string, parentId?: string): Span;
	getCurrentSpan(): Span | undefined;
}

export class MemorySpan implements Span {
	constructor(
		public readonly id: string,
		public readonly traceId: string,
		public readonly parentId: string | undefined = undefined,
		public readonly name: string,
		public readonly startTime = Date.now(),
		public tags: Record<string, string> = {},
		public events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }> = [],
	) {}

	public endTime?: number;

	end(): void {
		this.endTime = Date.now();
	}

	addEvent(name: string, attributes?: Record<string, unknown>): void {
		this.events.push({ name, timestamp: Date.now(), attributes });
	}

	setTag(key: string, value: string): void {
		this.tags[key] = value;
	}
}

export class MemoryTracer implements Tracer {
	private spans: Map<string, Span> = new Map();
	private currentSpan?: Span;
	public readonly traceId: string;

	constructor(
		public readonly id: string,
		traceId?: string,
	) {
		this.traceId = traceId ?? generateTraceId();
	}

	startSpan(name: string, parentId?: string): Span {
		const span = new MemorySpan(generateSpanId(), this.traceId, parentId ?? undefined, name);
		this.spans.set(span.id, span);
		this.currentSpan = span;
		return span;
	}

	getCurrentSpan(): Span | undefined {
		return this.currentSpan;
	}

	getAllSpans(): Span[] {
		return Array.from(this.spans.values());
	}
}

function generateTraceId(): string {
	return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateSpanId(): string {
	return `span-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const createTracer = (traceId?: string): Tracer => {
	return new MemoryTracer(traceId);
};
