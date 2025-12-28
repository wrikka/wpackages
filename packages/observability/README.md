# observability

Utilities for logging, metrics, and tracing helpers.

## Introduction

`observability` provides small, dependency-free building blocks to standardize logging (and later metrics/tracing) across Wrikka packages.

## Design Principles

- Minimal surface area
- Type-safe API
- Pluggable sinks/formatters
- Predictable behavior (level filtering, immutable metadata)

## Installation

This package is intended to be used from within the monorepo workspace.

```bash
bun add observability
```

## Usage

```ts
import { createConsoleLogger } from "observability";

const logger = createConsoleLogger({
	minLevel: "info",
	baseMeta: { service: "my-service" },
});

logger.info("service-start", { pid: process.pid });
logger.debug("this-will-not-log");
```

## Examples

### Child logger

```ts
import { createConsoleLogger } from "observability";

const logger = createConsoleLogger({ baseMeta: { service: "api" } });
const requestLogger = logger.child({ requestId: "req_123" });

requestLogger.info("request-start", { path: "/health" });
```

### Custom sink

```ts
import { createLogger } from "observability";

const events: unknown[] = [];

const logger = createLogger({
	sink: (record) => {
		events.push(record);
	},
});

logger.warn("rate-limited", { key: "ip" });
```

## License

MIT
