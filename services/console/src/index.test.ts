import { Effect, Layer } from "@wts/functional";
import { describe, expect, test, vi } from "vitest";
import { Console, ConsoleLive, error, info, warn } from "./index";

describe("@wts/console", () => {
	test("info/warn/error should fallback to log when not implemented", async () => {
		const logSpy = vi.fn();

		const ConsoleMock = Layer.succeed(Console, {
			log: (message: string) =>
				Effect.fromPromise(async () => {
					logSpy(message);
				}),
		});

		const program = Effect.gen(function*() {
			yield info("a");
			yield warn("b");
			yield error("c");
		});

		const result = await Effect.runPromiseEither(Effect.provideLayer(program, ConsoleMock));
		expect(result._tag).toBe("Right");
		expect(logSpy.mock.calls).toEqual([["a"], ["b"], ["c"]]);
	});

	test("ConsoleLive should call underlying console methods", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const program = Effect.gen(function*() {
			const svc = yield Effect.get(Console);
			yield svc.log("l");
			yield svc.info?.("i") ?? svc.log("i");
			yield svc.warn?.("w") ?? svc.log("w");
			yield svc.error?.("e") ?? svc.log("e");
		});

		const result = await Effect.runPromiseEither(Effect.provideLayer(program, ConsoleLive));
		expect(result._tag).toBe("Right");

		expect(log).toHaveBeenCalledWith("l");
		expect(infoSpy).toHaveBeenCalledWith("i");
		expect(warnSpy).toHaveBeenCalledWith("w");
		expect(errorSpy).toHaveBeenCalledWith("e");

		log.mockRestore();
		infoSpy.mockRestore();
		warnSpy.mockRestore();
		errorSpy.mockRestore();
	});
});
