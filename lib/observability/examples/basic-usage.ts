import { createCounter, createGauge, createHistogram, createLogger, createTracer } from "@wpackages/observability";

// Logging
const loggingExample = () => {
	console.log("=== Logging Example ===\n");

	const logger = createLogger("request-123");

	logger.info("Request received", { path: "/api/users" });
	logger.debug("Processing request", { userId: 1 });
	logger.warn("Slow response", { duration: 5000 });
	logger.error("Request failed", { error: "Database error" });
};

// Metrics
const metricsExample = () => {
	console.log("\n=== Metrics Example ===\n");

	// Counter
	const requestCounter = createCounter("http_requests_total", { method: "GET" });
	requestCounter.increment();
	requestCounter.increment(5);
	console.log("Counter:", requestCounter.value);

	// Gauge
	const activeConnections = createGauge("active_connections");
	activeConnections.set(10);
	activeConnections.increment();
	activeConnections.decrement();
	console.log("Gauge:", activeConnections.value);

	// Histogram
	const requestDuration = createHistogram("http_request_duration_ms", [1, 5, 10, 25, 50, 100, 250, 500, 1000]);
	requestDuration.observe(45);
	requestDuration.observe(120);
	console.log("Histogram:", requestDuration.values);
};

// Tracing
const tracingExample = async () => {
	console.log("\n=== Tracing Example ===\n");

	const tracer = createTracer();

	const span = tracer.startSpan("http_request");
	span.setTag("http.method", "GET");
	span.setTag("http.url", "/api/users");

	span.addEvent("database_query", { query: "SELECT * FROM users" });

	// Simulate async operation
	await new Promise((resolve) => setTimeout(resolve, 100));

	span.setTag("http.status_code", 200);
	span.end();

	console.log("Spans:", tracer.getAllSpans());
};

// Run all examples
const main = async () => {
	loggingExample();
	metricsExample();
	await tracingExample();
};

main();
