import { expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { Console, info, type LogEntry, Logger, LoggerConfigTag, makeLogger } from "../src";

test("Logger should log an informational message", async () => {
	const messages: LogEntry[] = [];

	// 1. Create a mock Console service layer
	const ConsoleTest = Layer.succeed(
		Console,
		{
			log: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			warn: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
			error: (line: string) => Effect.sync(() => messages.push(JSON.parse(line))),
		},
	);

	// 2. Create a mock Config service layer
	const ConfigTest = Layer.succeed(LoggerConfigTag, {});

	// 3. Build the logger layer from the makeLogger effect, and provide its dependencies
	const LoggerTest = Layer.effect(Logger, makeLogger).pipe(
		Layer.provide(ConsoleTest),
		Layer.provide(ConfigTest),
	);

	// 4. The program to test
	const program = info("test message");

	// 5. Run the program with the fully composed test layer
	await Effect.runPromise(program.pipe(Effect.provide(LoggerTest)));

	// 6. Assert the results
	expect(messages.length).toBe(1);
	const entry = messages[0];
	expect(entry.level).toBe("info");
	expect(entry.message).toBe("test message");
});
