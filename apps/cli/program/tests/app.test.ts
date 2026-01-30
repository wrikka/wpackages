import { Cause, Effect, Exit, Layer, Option } from "effect";
import { describe, expect, it, vi } from "vitest";
import { program } from "../src/app";
import { RandomGenerationError } from "../src/error";
import { Config, Logger, Random } from "../src/services";

describe("Program", () => {
	const ConfigMock = Layer.succeed(Config, {
		logLevel: "info",
	});

	const mockLogger = {
		info: vi.fn(() => Effect.void),
		error: vi.fn(() => Effect.void),
		warn: vi.fn(() => Effect.void),
		debug: vi.fn(() => Effect.void),
		log: vi.fn(() => Effect.void),
		child: vi.fn(() => mockLogger),
	};

	const LoggerMock = Layer.succeed(Logger, mockLogger);

	it("should run without errors and log a predictable number", async () => {
		const RandomMock = Layer.succeed(Random, {
			next: () => Effect.succeed(42),
		});

		const TestLayer = Layer.merge(ConfigMock, Layer.merge(LoggerMock, RandomMock));
		const testableProgram = program.pipe(Effect.provide(TestLayer));

		const result = await Effect.runPromiseExit(testableProgram);

		if (!Exit.isSuccess(result)) {
			throw new Error("Expected success Exit");
		}
		expect(mockLogger.info).toHaveBeenCalledWith("random-number-generated", { number: 42 });
	});

	it("should fail with RandomGenerationError when random service fails", async () => {
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
