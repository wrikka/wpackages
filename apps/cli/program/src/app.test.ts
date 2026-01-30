import { Cause, Effect, Exit, Layer, Option } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { program } from "./app";
import { TestConfigLive } from "./config/config.test";
import { RandomGenerationError } from "./error";
import { Logger, Random } from "./services";

describe("program", () => {
	// 1. Mock Services
	const mockLogger = {
		info: vi.fn(() => Effect.void),
		error: vi.fn(() => Effect.void),
		warn: vi.fn(() => Effect.void),
		debug: vi.fn(() => Effect.void),
		log: vi.fn(() => Effect.void),
		child: vi.fn(() => mockLogger), // Return itself for chaining
	};

	const TestLoggerLive = Layer.succeed(Logger, mockLogger);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should log a random number on success", async () => {
		// Arrange
		const TestRandomLive = Layer.succeed(Random, {
			next: () => Effect.succeed(0.5),
		});
		const TestLayer = Layer.merge(TestConfigLive, Layer.merge(TestLoggerLive, TestRandomLive));
		const runnable = program.pipe(Effect.provide(TestLayer));

		// Act
		const result = await Effect.runPromiseExit(runnable);

		// Assert
		if (!Exit.isSuccess(result)) {
			throw new Error("Expected success Exit");
		}
		expect(result.value).toBeUndefined(); // program returns void on success
		expect(mockLogger.info).toHaveBeenCalledWith("random-number-generated", { number: 0.5 });
	});

	it("should return a RandomGenerationError on failure", async () => {
		// Arrange
		const error = new RandomGenerationError({ reason: "Test failure" });
		const TestRandomLive = Layer.succeed(Random, {
			next: () => Effect.fail(error),
		});
		const TestLayer = Layer.merge(TestConfigLive, Layer.merge(TestLoggerLive, TestRandomLive));
		const runnable = program.pipe(Effect.provide(TestLayer));

		// Act
		const result = await Effect.runPromiseExit(runnable);

		// Assert
		if (!Exit.isFailure(result)) {
			throw new Error("Expected failure Exit");
		}
		const failure = Cause.failureOption(result.cause);
		if (!Option.isSome(failure)) {
			throw new Error("Expected failure cause to contain a failure value");
		}
		expect(failure.value).toBe(error);
		expect(mockLogger.info).not.toHaveBeenCalled();
	});
});
