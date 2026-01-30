# @wpackages/observability

## Introduction

`@wpackages/observability` is a lightweight, zero-dependency library that provides foundational building blocks for structured logging. It is designed to standardize how services and applications across the `wpackages` monorepo produce and handle log data, with plans to expand into metrics and tracing.

## Features

- 📝 **Structured Logging**: All log entries are structured records, making them easy to parse, query, and analyze.
- 🎯 **Contextual Metadata**: Easily add and inherit metadata through base and child loggers.
- 🔧 **Pluggable Sinks**: The logging output is decoupled via a `sink` interface, allowing you to easily direct logs to the console, a file, or a remote service.
- ✅ **Log Level Filtering**: Control log verbosity by setting a minimum log level.
- 🔒 **Type-Safe API**: A fully type-safe API for creating and interacting with loggers.

## Goal

- 🎯 **Standardize Observability**: To provide a single, consistent set of tools for logging, metrics, and tracing across the entire monorepo.
- 🧩 **Simplicity and Performance**: To offer a minimal, high-performance logging solution with no external dependencies.
- 🔧 **Extensibility**: To create a system that is easy to extend with custom formatters, sinks, and transports.

## Design Principles

- **Minimal Surface Area**: The API is designed to be as small and simple as possible.
- **Type Safety**: All interactions are designed to be type-safe.
- **Pluggable Architecture**: The core logging logic is decoupled from the output (sink) and formatting.
- **Predictable Behavior**: The library's behavior, such as level filtering and metadata inheritance, is designed to be simple and predictable.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Creating a Console Logger

```typescript
import { createConsoleLogger } from "@wpackages/observability";

const logger = createConsoleLogger({
	minLevel: "info",
	baseMeta: { service: "my-service" },
});

logger.info("service-start", { pid: process.pid });
logger.debug("this-will-not-log"); // Filtered out by minLevel
```

### Creating a Child Logger

Child loggers inherit metadata from their parent, which is useful for adding request-specific context.

```typescript
const baseLogger = createConsoleLogger({ baseMeta: { service: "api" } });
const requestLogger = baseLogger.child({ requestId: "req_123" });

// This log will include both { service: 'api' } and { requestId: 'req_123' }
requestLogger.info("request-start", { path: "/health" });
```

## License

This project is licensed under the MIT License.
