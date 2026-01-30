# @wpackages/logger

## Introduction

`@wpackages/logger` provides a structured, level-based, and context-aware logging service built natively for `Effect-TS`. It is designed to be a powerful and configurable logging solution with features like multiple formatters, pluggable sinks, data redaction, log spans, and tracing integration.

## Features

- 📝 **Structured Logging**: Outputs logs as structured data (JSON or pretty-printed), making them easy to parse, search, and analyze.
- 🎯 **Log Levels**: Supports multiple log levels (`debug`, `info`, `warn`, `error`) to control log verbosity.
- 🔧 **Pluggable Sinks**: Send logs to multiple destinations (console, file, custom sinks) simultaneously.
- 🎨 **Multiple Formatters**: Built-in JSON and pretty-print formatters with color support.
- 🔒 **Data Redaction**: Built-in utilities for redacting sensitive information (e.g., passwords, API keys) from logs.
- 👶 **Child Loggers**: Create child loggers that inherit and merge metadata from parent loggers.
- 🔍 **Log Spans**: Track duration and nested operations with span support.
- 📊 **Context Management**: Manage trace context and baggage across operations.
- ✅ **Effect-TS Native**: Implemented as an `Effect` service for seamless integration, composability, and testability.

## Goal

- 🎯 **Production-Ready Logging**: Provide a robust logging solution suitable for both development and production environments.
- 📈 **Actionable Insights**: Produce logs that are rich with context, making it easier to debug issues and understand application behavior.
- 🔒 **Secure**: Prevent sensitive data from being leaked into logs through built-in redaction capabilities.
- 🚀 **High Performance**: Minimal overhead with efficient log level filtering and pluggable architecture.

## Design Principles

- **Service-Oriented**: Logging is modeled as a service (`Logger`) that can be provided via a `Layer`.
- **Structured by Default**: The logger is designed to produce structured data, not just plain text strings.
- **Extensible**: The core logger can be extended with different formatters and sinks for various output targets.
- **Type-Safe**: Full TypeScript support with strict typing for all logger operations.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Basic Logging

```typescript
import { DefaultLoggerLayer, Logger } from "@wpackages/logger";
import { Effect } from "effect";

const program = Effect.gen(function*() {
	const logger = yield* Logger;

	yield* logger.info("Application starting up", { pid: process.pid });
	yield* logger.warn("Configuration is missing a value", { key: "API_URL" });
	yield* logger.debug("Entering critical section");
});

Effect.runPromise(Effect.provide(program, DefaultLoggerLayer));
```

### Using Pretty Print Formatter

```typescript
import {
	ConsoleLive,
	Logger,
	LoggerConfigTag,
	LoggerLive,
	prettyFormatter,
} from "@wpackages/logger";
import { Effect, Layer } from "effect";

const prettyConfigLayer = Layer.succeed(LoggerConfigTag, {
	minLevel: "info",
	formatter: prettyFormatter,
});

const program = Effect.gen(function*() {
	const logger = yield* Logger;
	yield* logger.info("Hello with colors!");
});

Effect.runPromise(
	Effect.provide(
		program,
		Layer.merge(LoggerLive, Layer.merge(prettyConfigLayer, ConsoleLive)),
	),
);
```

### Using Multiple Sinks

```typescript
import {
	ConsoleLive,
	createFileSink,
	createMultiSink,
	jsonFormatter,
	Logger,
	LoggerConfigTag,
	LoggerLive,
} from "@wpackages/logger";
import { Effect, Layer } from "effect";

const fileSink = createFileSink({
	filePath: "./logs/app.log",
	formatter: jsonFormatter,
});

const multiSinkConfigLayer = Layer.succeed(LoggerConfigTag, {
	minLevel: "info",
	sinks: [fileSink],
});

const program = Effect.gen(function*() {
	const logger = yield* Logger;
	yield* logger.info("This goes to both console and file");
});

Effect.runPromise(
	Effect.provide(
		program,
		Layer.merge(LoggerLive, Layer.merge(multiSinkConfigLayer, ConsoleLive)),
	),
);
```

### Child Logger with Merged Metadata

```typescript
import {
	ConsoleLive,
	Logger,
	LoggerConfigTag,
	LoggerLive,
} from "@wpackages/logger";
import { Effect, Layer } from "effect";

const configLayer = Layer.succeed(LoggerConfigTag, {
	baseMeta: { service: "api" },
});

const program = Effect.gen(function*() {
	const logger = yield* Logger;
	const requestLogger = logger.child({ requestId: "req_123" });

	yield* requestLogger.info("Request received", { path: "/users" });
});

Effect.runPromise(
	Effect.provide(
		program,
		Layer.merge(LoggerLive, Layer.merge(configLayer, ConsoleLive)),
	),
);
```

### Data Redaction

```typescript
import {
	ConsoleLive,
	Logger,
	LoggerConfigTag,
	LoggerLive,
} from "@wpackages/logger";
import { Effect, Layer } from "effect";

const configLayer = Layer.succeed(LoggerConfigTag, {
	redactKeys: ["password", "token", "apiKey"],
});

const program = Effect.gen(function*() {
	const logger = yield* Logger;
	yield* logger.info("User login", {
		username: "john",
		password: "secret123",
		token: "abc123",
	});
});

Effect.runPromise(
	Effect.provide(
		program,
		Layer.merge(LoggerLive, Layer.merge(configLayer, ConsoleLive)),
	),
);
```

### Log Spans

```typescript
import { createSpan, endSpan, Logger, withSpan } from "@wpackages/logger";
import { Effect } from "effect";

const program = Effect.gen(function*() {
	const span = createSpan("database-query");
	yield* withSpan(
		span,
		Effect.sync(() => {
			return fetchUserById(1);
		}),
	);
	const completedSpan = endSpan(span);
});

Effect.runPromise(program);
```

### Context Management

```typescript
import { LogContextTag, withBaggage, withLogContext } from "@wpackages/logger";
import { Effect } from "effect";

const program = Effect.gen(function*() {
	const context = yield* LogContextTag;
	yield* withLogContext(
		{ traceId: "trace_123" },
		Effect.gen(function*() {
			yield* withBaggage(
				{ userId: "user_456" },
				Effect.gen(function*() {
					yield* Effect.log("This log includes both traceId and userId");
				}),
			);
		}),
	);
});

Effect.runPromise(program);
```

## API Reference

### Types

- `LogLevel`: `"debug" | "info" | "warn" | "error"`
- `LogEntry`: Structured log entry with level, message, timestamp, and optional metadata
- `LogMeta`: Readonly record of key-value pairs for log metadata
- `LoggerConfig`: Configuration options for the logger
- `LogSink`: Function that receives a log entry and returns an Effect
- `LogFormatter`: Function that transforms a log entry into output format
- `Logger`: Main logger service with log methods
- `LogSpan`: Represents a span with id, name, startTime, endTime, and metadata
- `LogContext`: Represents trace context with traceId, spanId, and baggage

### Services

- `Logger`: Main logging service
- `Console`: Console output service
- `LoggerConfigTag`: Configuration service tag
- `LogContextTag`: Context service tag

### Layers

- `DefaultLoggerLayer`: Pre-configured logger layer with sensible defaults
- `ConsoleLive`: Live implementation of Console service
- `LoggerLive`: Live implementation of Logger service

### Formatters

- `jsonFormatter`: Formats log entries as JSON strings
- `prettyFormatter`: Formats log entries with colors and human-readable format
- `redactMeta`: Redacts sensitive data from metadata

### Sinks

- `createConsoleSink`: Creates a sink that writes to console
- `createFileSink`: Creates a sink that writes to a file
- `createMultiSink`: Creates a sink that sends logs to multiple sinks

### Tracing

- `createSpan`: Creates a new log span
- `endSpan`: Marks a span as completed
- `withSpan`: Wraps an effect with span tracking
- `withLogContext`: Provides log context to an effect
- `withBaggage`: Adds baggage to the current log context
- `getLogContext`: Retrieves the current log context

## License

This project is licensed under the MIT License.
