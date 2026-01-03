import { Effect } from "@wpackages/functional";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Console, ConsoleLive, log, logSpan } from "./index";

describe("@wts/console", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("ConsoleLive should call underlying console methods with primitives", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

		const program = Effect.gen(function*() {
			const svc = yield Effect.get(Console);
			yield svc.log("l");
			yield svc.info("i");
			yield svc.warn("w");
			yield svc.error("e");
			yield svc.debug("d");
			yield svc.fatal("f");
		});

		await Effect.runPromise(Effect.provideLayer(program, ConsoleLive));

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[LOG] l"));
		expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("[INFO] i"));
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[WARN] w"));
		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[ERROR] e"));
		expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("[DEBUG] d"));
		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[FATAL] f"));
	});

	test("ConsoleLive should call underlying console methods with objects", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const program = log({ a: 1 });

		await Effect.runPromise(Effect.provideLayer(program, ConsoleLive));

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[LOG]"), { a: 1 });
	});

	test("withContext should add context to log messages", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const program = Effect.gen(function*() {
			const svc = yield Effect.get(Console);
			const scopedSvc = svc.withContext("Auth");
			yield scopedSvc.log("User login");
		});

		await Effect.runPromise(Effect.provideLayer(program, ConsoleLive));

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[LOG] [Auth] User login"));
	});

	test("logSpan should provide a scoped logger", async () => {
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

		const program = Effect.gen(function*() {
			const scopedSvc = yield logSpan("Payment");
			yield scopedSvc.info("Processing payment");
		});

		await Effect.runPromise(Effect.provideLayer(program, ConsoleLive));

		expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("[INFO] [Payment] Processing payment"));
	});
});
