# @wpackages/logger

Logger service แบบ **Effect Tag** พร้อมรองรับ log levels, redaction, และ distributed tracing

## Features

- **4 Log Levels**: `debug`, `info`, `warn`, `error`
- **Sensitive Data Redaction**: Auto-redact ฟิลด์ที่ละเอียดอ่อน (password, token, secret, apiKey)
- **Child Loggers**: สร้าง logger ลูกที่ inherit metadata จาก parent
- **Multiple Formatters**: JSON, Pretty (with colors)
- **Pluggable Sinks**: Console, File, Multi-sink (concurrent)
- **Distributed Tracing**: Context, Span, Baggage support

## Installation

```bash
bun add @wpackages/logger
```

## Quick Start

```typescript
import { Effect } from "effect";
import { Logger, DefaultLoggerLayer } from "@wpackages/logger";

const program = Effect.gen(function*() {
  const logger = yield* Logger;
  yield* logger.info("Server started", { port: 3000 });
});

// Run with default layer
Effect.runPromise(program.pipe(Effect.provide(DefaultLoggerLayer)));
```

## Usage Examples

### Basic Logging

```typescript
import { Effect } from "effect";
import { Logger, DefaultLoggerLayer } from "@wpackages/logger";

const program = Effect.gen(function*() {
  const logger = yield* Logger;
  
  yield* logger.debug("Debug info");     // จะถูก filter ถ้า minLevel > debug
  yield* logger.info("User action");    // แสดงเสมอ
  yield* logger.warn("Low disk space");  // แสดงเสมอ
  yield* logger.error("DB connection failed", { error: "timeout" });
});

Effect.runPromise(program.pipe(Effect.provide(DefaultLoggerLayer)));
```

### Sensitive Data Redaction

```typescript
import { Logger, DefaultLoggerLayer, LoggerConfigTag } from "@wpackages/logger";
import { Layer } from "effect";

const ConfigWithRedaction = Layer.succeed(LoggerConfigTag, {
  redactKeys: ["password", "token", "creditCard"]
});

const program = Effect.gen(function*() {
  const logger = yield* Logger;
  yield* logger.info("User login", { 
    username: "john", 
    password: "secret123",  // จะถูก redact เป็น [REDACTED]
    token: "abc123"         // จะถูก redact เป็น [REDACTED]
  });
});

Effect.runPromise(
  program.pipe(Effect.provide(DefaultLoggerLayer.pipe(Layer.provide(ConfigWithRedaction))))
);
```

### Child Logger with Context

```typescript
const program = Effect.gen(function*() {
  const logger = yield* Logger;
  
  // สร้าง child logger ที่มี base metadata
  const requestLogger = logger.child({ requestId: "req-123", userId: "user-456" });
  
  yield* requestLogger.info("Request started");
  yield* requestLogger.info("Processing", { step: "validation" });
  yield* requestLogger.info("Completed");  // ทุก log จะมี requestId และ userId
});
```

### Custom Configuration

```typescript
import { LoggerConfigTag, jsonFormatter, createFileSink } from "@wpackages/logger";
import { Layer } from "effect";

const CustomConfig = Layer.succeed(LoggerConfigTag, {
  minLevel: "warn",           // แสดงแค่ warn และ error
  formatter: jsonFormatter,   // ใช้ JSON format
  sinks: [createFileSink({ filePath: "/var/log/app.log", formatter: jsonFormatter })],
  baseMeta: { service: "api", version: "1.0.0" }
});
```

### Tracing with Context

```typescript
import { withLogContext, withBaggage, generateTraceId } from "@wpackages/logger";

const traceId = generateTraceId();

const program = Effect.gen(function*() {
  const logger = yield* Logger;
  yield* logger.info("Processing payment");
}).pipe(
  withLogContext({ traceId, spanId: "span-1" }),
  withBaggage({ userId: "user-123", orderId: "order-456" })
);
```

## API Reference

### Types

| Type | Description |
|------|-------------|
| `LogLevel` | `"debug" \| "info" \| "warn" \| "error"` |
| `LogEntry` | `{ level, message, timestamp, meta? }` |
| `LogMeta` | `Record<string, unknown>` |
| `LogFormatter<T>` | `(entry: LogEntry) => T` |
| `LogSink` | `(entry: LogEntry) => Effect<void>` |

### Logger Interface

```typescript
interface Logger {
  readonly log: (entry: LogEntry) => Effect<void>;
  readonly debug: (message: string, meta?: LogMeta) => Effect<void>;
  readonly info: (message: string, meta?: LogMeta) => Effect<void>;
  readonly warn: (message: string, meta?: LogMeta) => Effect<void>;
  readonly error: (message: string, meta?: LogMeta) => Effect<void>;
  readonly child: (meta: LogMeta) => Logger;
}
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run build` | Build with tsdown |
| `bun run dev` | Run in watch mode |
| `bun run test` | Run tests with vitest |
| `bun run lint` | Run typecheck and oxlint |
| `bun run format` | Format with dprint |
| `bun run verify` | Run full verification |

## License

MIT