import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
	Console,
	createMultiSink,
	jsonFormatter,
	type LogEntry,
	Logger,
	LoggerConfigTag,
	prettyFormatter,
	redactMeta,
} from "../src";

describe("Logger", () => {
	it("should log an informational message", async () => {
		const messages: LogEntry[] = [];

		const ConsoleTest = Layer.succeed(
			Console,
			{
				log: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				warn: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				error: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			},
		);

		const ConfigTest = Layer.succeed(LoggerConfigTag, {});

		const program = Effect.gen(function*() {
			const logger = yield* Logger;
			yield* logger.info("test message");
		});

		await Effect.runPromise(program.pipe(Effect.provide(Layer.merge(ConsoleTest, ConfigTest))));

		expect(messages.length).toBe(1);
		const entry = messages[0];
		expect(entry.level).toBe("info");
		expect(entry.message).toBe("test message");
	});

	it("should filter logs by minLevel", async () => {
		const messages: LogEntry[] = [];

		const ConsoleTest = Layer.succeed(
			Console,
			{
				log: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				warn: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				error: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			},
		);

		const ConfigTest = Layer.succeed(LoggerConfigTag, { minLevel: "warn" });

		const program = Effect.gen(function*() {
			const logger = yield* Logger;
			yield* logger.debug("debug message");
			yield* logger.info("info message");
			yield* logger.warn("warn message");
			yield* logger.error("error message");
		});

		await Effect.runPromise(program.pipe(Effect.provide(Layer.merge(ConsoleTest, ConfigTest))));

		expect(messages.length).toBe(2);
		expect(messages[0].level).toBe("warn");
		expect(messages[1].level).toBe("error");
	});

	it("should redact sensitive data", async () => {
		const messages: LogEntry[] = [];

		const ConsoleTest = Layer.succeed(
			Console,
			{
				log: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				warn: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				error: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			},
		);

		const ConfigTest = Layer.succeed(LoggerConfigTag, {
			redactKeys: ["password", "token"],
		});

		const program = Effect.gen(function*() {
			const logger = yield* Logger;
			yield* logger.info("user login", { password: "secret123", token: "abc123", username: "john" });
		});

		await Effect.runPromise(program.pipe(Effect.provide(Layer.merge(ConsoleTest, ConfigTest))));

		expect(messages.length).toBe(1);
		const entry = messages[0];
		expect(entry.meta?.password).toBe("[REDACTED]");
		expect(entry.meta?.token).toBe("[REDACTED]");
		expect(entry.meta?.username).toBe("john");
	});

	it("should support child logger with merged meta", async () => {
		const messages: LogEntry[] = [];

		const ConsoleTest = Layer.succeed(
			Console,
			{
				log: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				warn: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
				error: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			},
		);

		const ConfigTest = Layer.succeed(LoggerConfigTag, { baseMeta: { service: "api" } });

		const program = Effect.gen(function*() {
			const logger = yield* Logger;
			const childLogger = logger.child({ requestId: "req_123" });
			yield* childLogger.info("request received", { path: "/users" });
		});

		await Effect.runPromise(program.pipe(Effect.provide(Layer.merge(ConsoleTest, ConfigTest))));

		expect(messages.length).toBe(1);
		const entry = messages[0];
		expect(entry.meta?.service).toBe("api");
		expect(entry.meta?.requestId).toBe("req_123");
		expect(entry.meta?.path).toBe("/users");
	});
});

describe("Formatters", () => {
	it("jsonFormatter should format log entry as JSON", () => {
		const entry: LogEntry = {
			level: "info",
			message: "test",
			timestamp: 1234567890,
			meta: { key: "value" },
		};

		const result = jsonFormatter(entry);
		const parsed = JSON.parse(result);

		expect(parsed.level).toBe("info");
		expect(parsed.message).toBe("test");
		expect(parsed.meta?.key).toBe("value");
	});

	it("prettyFormatter should format log entry with colors", () => {
		const entry: LogEntry = {
			level: "info",
			message: "test",
			timestamp: 1234567890,
		};

		const result = prettyFormatter(entry);

		expect(result).toContain("INFO");
		expect(result).toContain("test");
		expect(result).toContain("\x1b[32m");
	});

	it("redactMeta should redact sensitive keys", () => {
		const meta = { password: "secret", token: "abc", username: "john" };
		const redacted = redactMeta(meta, ["password", "token"]);

		expect(redacted?.password).toBe("[REDACTED]");
		expect(redacted?.token).toBe("[REDACTED]");
		expect(redacted?.username).toBe("john");
	});
});

describe("Sinks", () => {
	it("createMultiSink should send logs to all sinks", async () => {
		const sink1Messages: string[] = [];
		const sink2Messages: string[] = [];

		const sink1 = (entry: LogEntry) => Effect.sync(() => sink1Messages.push(entry.message));
		const sink2 = (entry: LogEntry) => Effect.sync(() => sink2Messages.push(entry.message));

		const multiSink = createMultiSink([sink1, sink2]);
		const entry: LogEntry = {
			level: "info",
			message: "test",
			timestamp: Date.now(),
		};

		await Effect.runPromise(multiSink(entry));

		expect(sink1Messages.length).toBe(1);
		expect(sink2Messages.length).toBe(1);
		expect(sink1Messages[0]).toBe("test");
		expect(sink2Messages[0]).toBe("test");
	});
});
