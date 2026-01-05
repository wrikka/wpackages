import { createLogger, type LogRecord } from "@wpackages/observability";
import { describe, expect, jest, test } from "bun:test";
import { Cause, Effect, Exit, Layer, Option } from "effect";
import { program } from "../src/app";
import { RandomGenerationError } from "../src/error";
import { Config, Logger, Random } from "../src/services";

describe("Program", () => {
	const mockSink = jest.fn();

	const ConfigMock = Layer.succeed(Config, {
		logLevel: "info",
	});

	const LoggerMock = Layer.succeed(
		Logger,
		createLogger({
			minLevel: "info",
			sink: (record: LogRecord) => {
				mockSink(record);
			},
		}),
	);

	test("should run without errors and log a predictable number", async () => {
		const RandomMock = Layer.succeed(Random, {
			next: () => Effect.succeed(42),
		});

		const TestLayer = Layer.merge(ConfigMock, Layer.merge(LoggerMock, RandomMock));
		const testableProgram = program.pipe(Effect.provide(TestLayer));

		const result = await Effect.runPromiseExit(testableProgram);

		if (!Exit.isSuccess(result)) {
			throw new Error("Expected success Exit");
		}
		expect(mockSink).toHaveBeenCalledWith(
			expect.objectContaining({
				level: "info",
				message: "random-number-generated",
				meta: { number: 42 },
			}),
		);
	});

	test("should fail with RandomGenerationError when random service fails", async () => {
		const error = new RandomGenerationError({ reason: "Test failure" });
		const RandomMock = Layer.succeed(Random, {
			next: () => Effect.fail(error),
		});

		const TestLayer = Layer.merge(ConfigMock, Layer.merge(LoggerMock, RandomMock));
		const testableProgram = program.pipe(Effect.provide(TestLayer));

		const result = await Effect.runPromiseExit(testableProgram);

		if (!Exit.isFailure(result)) {
			throw new Error("Expected failure Exit");
		}
		const failure = Cause.failureOption(result.cause);
		if (!Option.isSome(failure)) {
			throw new Error("Expected failure cause to contain a failure value");
		}
		expect(failure.value).toBeInstanceOf(RandomGenerationError);
		expect((failure.value as RandomGenerationError).reason).toBe("Test failure");
	});
});
