import { createLogger, type LogRecord } from "@wpackages/observability";
import { describe, expect, jest, test } from "bun:test";
import { program } from "../src/app";
import { RandomGenerationError } from "../src/error";
import { Effect, Layer } from "../src/lib/functional";
import { Config, Logger, Random } from "../src/services";

describe("Program", () => {
	const mockSink = jest.fn();

	const ConfigMock = Layer.succeed(Config, {
		logLevel: "info",
	});

	const LoggerMock = Effect.map(Effect.get(Config), (config) => ({
		[Logger.key]: createLogger({
			minLevel: config.logLevel,
			sink: (record: LogRecord) => {
				mockSink(record);
			},
		}),
	}));

	test("should run without errors and log a predictable number", async () => {
		const RandomMock = Layer.succeed(Random, {
			next: () => Effect.succeed(42),
		});

		const TestLayer = Layer.merge(
			ConfigMock,
			Layer.merge(LoggerMock, RandomMock),
		);
		const testableProgram = Effect.provideLayer(program, TestLayer);

		const result = await Effect.runPromiseEither(testableProgram);

		expect(result._tag).toBe("Right");
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

		const TestLayer = Layer.merge(
			ConfigMock,
			Layer.merge(LoggerMock, RandomMock),
		);
		const testableProgram = Effect.provideLayer(program, TestLayer);

		const result = await Effect.runPromiseEither(testableProgram);

		expect(result._tag).toBe("Left");
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(RandomGenerationError);
			expect(result.left.reason).toBe("Test failure");
		}
	});
});
