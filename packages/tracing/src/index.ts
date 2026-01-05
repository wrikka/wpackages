/**
 * @wpackages/tracing
 *
 * A lightweight, zero-dependency, and high-performance tracing library inspired by OpenTelemetry,
 * tailored for the wpackages monorepo.
 */

// High-level API for easy initialization
export { init } from "./config/tracing.config";
export type { TracingConfig } from "./config/tracing.config";

// Core API (for advanced manual setup)
export { TracerProvider } from "./services/provider.service";

// Processors
export { SimpleSpanProcessor } from "./services/processor.service";
export { BatchSpanProcessor } from "./services/processor.service";

// Exporters
export { ConsoleSpanExporter } from "./services/exporter.service";
export { InMemorySpanExporter } from "./services/exporter.service";
export { WebUiExporter } from "./services/exporter.service";

// Context
export { getActiveSpan, withActiveSpan } from "./services/context.service";

// No-op implementation for disabling tracing
export { NOOP_TRACER } from "./services/tracer.service";

// Propagation
export { W3cTraceContextPropagator, W3cBaggagePropagator, CompositePropagator } from "./services/propagation.service";

// Baggage
export { createBaggage } from "./models/baggage";
export type { Baggage, BaggageEntry } from "./models/baggage";

// Context
export { getActiveBaggage, withActiveBaggage, getActiveContext, withActiveContext } from "./services/context.service";

// Instrumentations
export { FetchInstrumentation } from "./services/instrumentation.service";
export { HttpInstrumentation, ExpressInstrumentation } from "./services/instrumentation.service";

// Samplers
export { ParentBasedSampler, TraceIdRatioBasedSampler } from "./services/sampler.service";

// Utils
export { registerGracefulShutdown } from "./utils/shutdown.util";
export { getTraceContext } from "./utils/log.util";

// Metrics
export { MeterProviderImpl as MeterProvider, ConsoleMetricExporter, InMemoryMetricReader } from "./services/metrics.service";
export type { Meter, Counter, MetricExporter, MetricReader } from "./types/metrics";

// All public types
export type * from "./types/tracing";
