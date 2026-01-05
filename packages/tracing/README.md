# @wpackages/tracing

Lightweight, zero-dependency tracing primitives designed to be the foundation for observability in the `wpackages` monorepo.

## Features

- **OpenTelemetry-inspired API**: Familiar concepts like `TracerProvider`, `SpanProcessor`, and `Exporter` without the complexity.
- **Zero Dependencies**: Lightweight and performant, perfect for any environment.
- **Automatic Instrumentation**: Out-of-the-box support for `fetch` requests.
- **Context Propagation**: W3C Trace Context (`traceparent`) support for distributed tracing.
- **Batch Processing**: Spans are efficiently batched before being exported to minimize I/O overhead.
- **Configurable Sampling**: Control trace volume with parent-based and trace ID ratio-based samplers.
- **W3C Baggage Propagation**: Propagate key-value pairs across service boundaries.
- **Log Correlation**: Easily inject trace context into your structured logs.
- **Metrics API Foundation**: A foundational API for recording counters and other metrics is included.

## Quick Start

Get started with tracing in just a few lines of code.

1. **Initialize the Provider**

   Create a file (e.g., `tracing.ts`) to initialize the tracing system. This should be imported as early as possible in your application's lifecycle.

   ```typescript
   // src/tracing.ts
   import { init } from "@wpackages/tracing";

   // This sets up a tracer provider with:
   // - A ConsoleSpanExporter to print traces to the console.
   // - A BatchSpanProcessor for efficient exporting.
   // - FetchInstrumentation to automatically trace HTTP requests.
   export const provider = init();
   ```

2. **Get a Tracer and Create Spans**

   In your application code, get a tracer from the provider and start creating spans.

   ```typescript
   import { provider } from "./tracing";

   const tracer = provider.getTracer("my-app");

   async function doWork() {
   	await tracer.trace("doWork", async (span) => {
   		span.setAttribute("my.attribute", "my-value");
   		console.log("Doing some work...");
   		// This fetch call will be automatically traced!
   		await fetch("https://example.com");
   	});
   }

   doWork().finally(() => {
   	// Gracefully shutdown the provider to flush any remaining spans
   	provider.shutdown();
   });
   ```

## Advanced Usage

For more complex scenarios, you can manually construct the `TracerProvider` with custom exporters, processors, or instrumentations. See the source code for more details.
