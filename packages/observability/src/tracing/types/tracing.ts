export type SpanId = string;
export type TraceId = string;

export interface SpanContext {
	traceId: TraceId;
	spanId: SpanId;
}

/**
 * Represents the active context, which can contain a span, baggage, and other values.
 */
export interface Context {
	getValue(key: symbol): unknown;
	setValue(key: symbol, value: unknown): Context;
	deleteValue(key: symbol): Context;
}

export interface Resource {
	readonly attributes: Record<string, unknown>;
	merge(other: Resource): Resource;
}

export interface SpanLink {
	context: SpanContext;
	attributes?: Record<string, unknown>;
}

export enum SamplingDecision {
	NOT_RECORD = 0,
	RECORD = 1,
	RECORD_AND_SAMPLE = 2,
}

export interface SamplingResult {
	decision: SamplingDecision;
	attributes?: Record<string, unknown>;
}

export interface Sampler {
	shouldSample(context: Context, traceId: TraceId, spanName: string, parentContext?: SpanContext): SamplingResult;
}

export interface Span extends SpanContext {
	readonly resource: Resource;
	readonly parentId: SpanId | undefined;
	readonly name: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly status: SpanStatus;
	readonly attributes: Record<string, unknown>;
	readonly events: SpanEvent[];
	readonly links: SpanLink[];

	end: (endTime?: number) => void;
	setStatus: (status: SpanStatus) => this;
	setAttribute: (key: string, value: unknown) => this;
	addEvent: (name: string, attributes?: Record<string, unknown>) => this;
}

export type SpanStatus = "unset" | "ok" | "error";

export interface SpanEvent {
	name: string;
	time: number;
	attributes?: Record<string, unknown>;
}

export interface BatchSpanProcessorConfig {
	/** The maximum queue size. After the size is reached spans are dropped. */
	maxQueueSize?: number;
	/** The maximum batch size of every export. It must be smaller or equal to maxQueueSize. */
	maxExportBatchSize?: number;
	/** The interval between two consecutive exports */
	scheduledDelayMillis?: number;
	/** How long the export can run before it is cancelled */
	exportTimeoutMillis?: number;
}

export interface SpanProcessor {
	/**
	 * Called when a span is started.
	 */
	onStart(span: Span): void;

	/**
	 * Called when a span is ended.
	 */
	onEnd(span: Span): void;

	/**
	 * Shuts down the processor, flushing any buffered spans.
	 */
	shutdown(): Promise<void>;
}

export interface SpanExporter {
	/**
	 * Exports a batch of spans.
	 */
	export(spans: Span[]): Promise<void>;

	/**
	 * Shuts down the exporter.
	 */
	shutdown(): Promise<void>;
}

// Propagation interfaces inspired by OpenTelemetry
export interface TextMapGetter<Carrier = any> {
	get(carrier: Carrier, key: string): string | undefined;
	keys(carrier: Carrier): string[];
}

export interface TextMapSetter<Carrier = any> {
	set(carrier: Carrier, key: string, value: string): void;
}

export interface TextMapPropagator {
	/**
	 * Injects context into a carrier.
	 */
	inject(context: Context, carrier: unknown, setter: TextMapSetter): void;

	/**
	 * Extracts context from a carrier.
	 */
	extract(context: Context, carrier: unknown, getter: TextMapGetter): Context;
}

export interface SpanOptions {
	/** A manually provided parent span context. */
	parent?: Span | SpanContext;
	/** The carrier object from which to extract context. e.g., HTTP headers. */
	carrier?: unknown;
	/** The propagator to use for extraction. Defaults to W3C Trace Context. */
	propagator?: TextMapPropagator;
	/** The getter utility for the specified carrier. */
	getter?: TextMapGetter;
	/** A list of links to other spans. */
	links?: SpanLink[];
	/** Initial attributes for the span. */
	attributes?: Record<string, unknown>;
}

export interface Instrumentation {
	/** Instrumentation name */
	readonly name: string;
	/** Instrumentation version */
	readonly version?: string;

	/** Enables the instrumentation. */
	enable(tracer: Tracer): void;

	/** Disables the instrumentation. */
	disable(): void;
}

export interface TracerProviderConfig {
	processor: SpanProcessor;
	instrumentations?: Instrumentation[];
	resource?: Resource;
	sampler?: Sampler;
}

export interface Tracer {
	startSpan: (name: string, options?: SpanOptions) => Span;
	trace: <T>(name: string, fn: (span: Span) => T | Promise<T>, options?: SpanOptions) => Promise<T>;
}
