import { describe, expect, it } from "vitest";
import { createDevServer } from "./index";

describe("DevServer Package", () => {
	it("should export createDevServer function", () => {
		expect(typeof createDevServer).toBe("function");
	});

	it("should create a dev server instance", () => {
		const server = createDevServer();

		expect(server).toBeDefined();
		expect(typeof server.start).toBe("function");
		expect(typeof server.stop).toBe("function");
		expect(typeof server.onReload).toBe("function");
		expect(typeof server.getStats).toBe("function");
		expect(typeof server.getPerformanceStats).toBe("function");
		expect(typeof server.getRecommendations).toBe("function");
	});

	it("should accept configuration options", () => {
		const server = createDevServer({
			port: 4000,
			hostname: "127.0.0.1",
			root: "/test/path",
		});

		expect(server).toBeDefined();
	});
});
