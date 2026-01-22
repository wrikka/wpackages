import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
	init,
	InMemorySpanExporter as WsInMemorySpanExporter,
	NOOP_TRACER,
	SimpleSpanProcessor as WsSimpleSpanProcessor,
} from "@wpackages/tracing";
import { Bench } from "tinybench";

const bench = new Bench({ time: 100 });

// --- @wpackages/tracing Setup ---
const wsExporter = new WsInMemorySpanExporter();
const wsProcessor = new WsSimpleSpanProcessor(wsExporter);
const wsProvider = await init({ processor: wsProcessor, instrumentations: [] });
const wsTracer = wsProvider.getTracer("wpackages-bench");

// --- OpenTelemetry Setup ---
const otelProvider = new BasicTracerProvider();
const otelExporter = new InMemorySpanExporter();
const otelProcessor = new SimpleSpanProcessor(otelExporter);
otelProvider.addSpanProcessor(otelProcessor);
const otelTracer = otelProvider.getTracer("otel-bench");

// --- Benchmark Suite ---

bench
	.add("@wpackages/tracing (active)", async () => {
		await wsTracer.trace("active-span", (span) => {
			span.setAttribute("key", "value");
		});
	})
	.add("@wpackages/tracing (no-op)", async () => {
		await NOOP_TRACER.trace("noop-span", (span) => {
			span.setAttribute("key", "value");
		});
	})
	.add("OpenTelemetry (active)", async () => {
		const span = otelTracer.startSpan("otel-span");
		span.setAttribute("key", "value");
		span.end();
	})
	.add("console.time", () => {
		console.time("manual-trace");
		console.timeEnd("manual-trace");
	});

// --- Run and Report ---

async function run() {
	await bench.run();
	console.table(bench.table());
}

await run();
