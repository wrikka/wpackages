import { Effect, Layer } from "@wts/functional";
import { describe, expect, test, vi } from "vitest";
import { program } from "./app";
import { Console, Random } from "./services";

describe("Program", () => {
	test("should run without errors and log a predictable number", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const ConsoleMock = Layer.succeed(Console, {
			log: (message: string) =>
				Effect.tap(Effect.succeed(undefined), () => {
					consoleSpy(message);
				}),
		});

		const RandomMock = Layer.succeed(Random, {
			next: () => Effect.succeed(42),
		});

		const TestLive = Layer.merge(ConsoleMock, RandomMock);

		const testableProgram = Effect.provideLayer(program, TestLive);

		const result = await Effect.runPromiseEither(testableProgram);
		expect(result._tag).toBe("Right");

		expect(consoleSpy).toHaveBeenCalledWith("Your random number is: 42");

		consoleSpy.mockRestore();
	});
});
