import { performance } from "node:perf_hooks";
import { getActiveContext, getActiveSpan, withActiveSpan } from "./context.service";
import { getSpan } from "../models/context";
import type { Sampler, Span, SpanContext, SpanEvent, SpanId, SpanLink, SpanOptions, SpanProcessor, SpanStatus, Tracer, TextMapGetter, TraceId } from "../types/tracing";
import { SamplingDecision } from "../types/tracing";
import { Resource } from "../models/resource";
import { W3cTraceContextPropagator } from "./propagation.service";

const defaultPropagator = new W3cTraceContextPropagator();

const defaultGetter: TextMapGetter<Record<string, string>> = {
	get(carrier, key) {
		return carrier[key];
	},
	keys(carrier) {
		return Object.keys(carrier);
	},
};

class SpanImpl implements Span {
	readonly resource: Resource;
	private readonly processor: SpanProcessor;
	readonly name: string;
	readonly context: SpanContext;
	readonly parentId: SpanId | undefined;
	readonly startTime: number;
	readonly traceId: TraceId;
	readonly spanId: SpanId;
	readonly links: SpanLink[];

	endTime?: number;
	status: SpanStatus = "unset";
	attributes: Record<string, unknown> = {};
	events: SpanEvent[] = [];

	constructor(name: string, context: SpanContext, processor: SpanProcessor, resource: Resource, parentId?: SpanId, links: SpanLink[] = [], attributes: Record<string, unknown> = {}) {
		this.name = name;
		this.context = context;
		this.traceId = context.traceId;
		this.spanId = context.spanId;
		this.processor = processor;
		this.resource = resource;
		this.parentId = parentId;
		this.startTime = performance.now();
		this.links = links;
		this.attributes = attributes;
	}

	end(endTime?: number): void {
		if (this.endTime) {
			// Span has already been ended
			return;
		}
		this.endTime = endTime ?? performance.now();
		this.processor.onEnd(this);
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
		const event: SpanEvent = { name, time: performance.now() };
		if (attributes) {
			event.attributes = attributes;
		}
		this.events.push(event);
		return this;
	}
}

export class TracerImpl implements Tracer {
	private readonly resource: Resource;
	private readonly processor: SpanProcessor;
	private readonly sampler: Sampler;

	constructor(processor: SpanProcessor, resource: Resource, sampler: Sampler) {
		this.processor = processor;
		this.resource = resource;
		this.sampler = sampler;
	}
	startSpan(name: string, options: SpanOptions = {}): Span {
		let parent: Span | SpanContext | undefined = options.parent;

		if (!parent && options.carrier) {
			const propagator = options.propagator ?? defaultPropagator;
			const getter = options.getter ?? defaultGetter;
			const newContext = propagator.extract(getActiveContext(), options.carrier, getter);
			parent = getSpan(newContext);
		}

		if (!parent) {
			parent = getActiveSpan();
		}

		const parentContext = parent && 'spanId' in parent ? parent : undefined;
		const traceId = parentContext?.traceId ?? crypto.randomUUID();

		const samplingResult = this.sampler.shouldSample(getActiveContext(), traceId, name, parentContext);

		if (samplingResult.decision === SamplingDecision.NOT_RECORD) {
			return new NoopSpan(name, { traceId, spanId: crypto.randomUUID() }, parentContext?.spanId);
		}

		const spanId = crypto.randomUUID();
		const context = { traceId, spanId };
		const attributes = { ...samplingResult.attributes, ...options.attributes };
		const span = new SpanImpl(name, context, this.processor, this.resource, parentContext?.spanId, options.links, attributes);
		this.processor.onStart(span);
		return span;
	}

	async trace<T>(name: string, fn: (span: Span) => T | Promise<T>, options: SpanOptions = {}): Promise<T> {
		const span = this.startSpan(name, options);
		try {
			return await withActiveSpan(span, () => fn(span));
		} catch (error) {
			span.setStatus("error");
			if (error instanceof Error) {
				span.setAttribute("error.message", error.message);
			}
			throw error;
		} finally {
			span.end();
		}
	}
}

class NoopSpan implements Span {
	readonly resource: Resource = new Resource({});
	readonly name: string;
	readonly context: SpanContext;
	readonly parentId: SpanId | undefined;
	readonly startTime: number = 0;
	readonly endTime?: number;
	readonly status: SpanStatus = "unset";
	readonly attributes: Record<string, unknown> = {};
	readonly events: SpanEvent[] = [];
	readonly links: SpanLink[] = [];
	readonly traceId: TraceId;
	readonly spanId: SpanId;

	constructor(name: string, context: SpanContext, parentId?: SpanId) {
		this.name = name;
		this.context = context;
		this.traceId = context.traceId;
		this.spanId = context.spanId;
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
	startSpan: (name: string, _options?: SpanOptions) => {
		return new NoopSpan(name, { traceId: "", spanId: "" });
	},
	async trace<T>(name: string, fn: (span: Span) => T | Promise<T>, _options?: SpanOptions): Promise<T> {
		const span = new NoopSpan(name, { traceId: "", spanId: "" });
		return Promise.resolve(fn(span));
	},
};
