# Getting Started

## Installation

```bash
bun add @wpackages/observability
```

## Basic Usage

### Logging

```typescript
import { createLogger } from "@wpackages/observability";

const logger = createLogger("request-123");

logger.info("Request received", { path: "/api/users" });
logger.debug("Processing request", { userId: 1 });
logger.warn("Slow response", { duration: 5000 });
logger.error("Request failed", { error: "Database error" });
```

### Metrics

```typescript
import {
	createCounter,
	createGauge,
	createHistogram,
} from "@wpackages/observability";

// Counter
const requestCounter = createCounter("http_requests_total", { method: "GET" });
requestCounter.increment();
requestCounter.increment(5);

// Gauge
const activeConnections = createGauge("active_connections");
activeConnections.set(10);
activeConnections.increment();
activeConnections.decrement();

// Histogram
const requestDuration = createHistogram("http_request_duration_ms", [
	1,
	5,
	10,
	25,
	50,
	100,
	250,
	500,
	1000,
]);
requestDuration.observe(45);
requestDuration.observe(120);
```

### Tracing

```typescript
import { createTracer } from "@wpackages/observability";

const tracer = createTracer();

const span = tracer.startSpan("http_request");
span.setTag("http.method", "GET");
span.setTag("http.url", "/api/users");

span.addEvent("database_query", { query: "SELECT * FROM users" });

const result = await fetchUsers();

span.setTag("http.status_code", 200);
span.end();

console.log(tracer.getAllSpans());
```
