# API Reference

This document provides a detailed reference for the core APIs of `@wpackages/tracing`.

## High-Level API

### `init(config: TracingConfig): Promise<TracerProvider>`

This is the main entry point for initializing the tracing system. It simplifies setup by creating and configuring the necessary components based on the provided configuration.

- **`config`**: An optional `TracingConfig` object.

Returns a `Promise` that resolves to a fully configured `TracerProvider` instance.

## Core Concepts

### `TracerProvider`

The central component for managing the tracing lifecycle. It holds the configuration for the `SpanProcessor`, `Sampler`, `Resource`, and `Instrumentations`.

### `Tracer`

Responsible for creating spans. You get a `Tracer` instance from a `TracerProvider`.

### `Span`

Represents a single unit of work or operation. It has a start time, end time, attributes, events, and links.

### `SpanProcessor`

A pluggable component that receives notifications for span lifecycle events (`onStart`, `onEnd`).

- **`SimpleSpanProcessor`**: Forwards spans to an exporter immediately upon completion.
- **`BatchSpanProcessor`**: Buffers spans and sends them in batches for better performance.

### `SpanExporter`

Responsible for sending trace data to a destination.

- **`ConsoleSpanExporter`**: Prints spans to the console.
- **`WebUiExporter`**: Sends spans to the local web UI.
- **`InMemorySpanExporter`**: Stores spans in memory for testing.

### `Sampler`

Makes decisions on whether to record and sample a span.

- **`ParentBasedSampler`**: Respects the sampling decision of the parent span.
- **`TraceIdRatioBasedSampler`**: Samples a specific fraction of traces.

### `Instrumentation`

Automatically creates spans for common operations.

- **`FetchInstrumentation`**: For `fetch` requests (browser and Node.js).
- **`HttpInstrumentation`**: For `node:http` client requests.
- **`ExpressInstrumentation`**: For Express.js server requests.
