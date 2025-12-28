import { describe, expect, it, vi } from "vitest";

import { createConsoleLogger } from "./logger";

describe("logger", () => {
	it("creates a logger that logs without throwing", () => {
		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
		const logger = createConsoleLogger();

		expect(() => logger.log("debug", "hello", { a: 1 })).not.toThrow();

		expect(debugSpy).toHaveBeenCalledTimes(1);
		debugSpy.mockRestore();
	});

	it("supports minLevel filtering", () => {
		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const logger = createConsoleLogger({ minLevel: "info" });

		logger.debug("should-not-log");
		logger.info("should-log");

		expect(debugSpy).toHaveBeenCalledTimes(0);
		expect(infoSpy).toHaveBeenCalledTimes(1);

		debugSpy.mockRestore();
		infoSpy.mockRestore();
	});

	it("supports child logger meta merging", () => {
		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const logger = createConsoleLogger({ baseMeta: { a: 1 } });
		const child = logger.child({ b: 2 });

		child.info("hello", { c: 3 });

		expect(infoSpy).toHaveBeenCalledTimes(1);
		const payload = infoSpy.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(payload).toMatchObject({ message: "hello", a: 1, b: 2, c: 3 });

		infoSpy.mockRestore();
	});
});
