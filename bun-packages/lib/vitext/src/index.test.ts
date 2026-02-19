import { describe, expect, it } from "vitest";
import { DEFAULT_SERVER_CONFIG } from "./constant/defaults";
import { createVitextApp } from "./index";

describe("Vitext Framework", () => {
	it("should create a vitext app with default configuration", async () => {
		const app = await createVitextApp();

		expect(app).toBeDefined();
		expect(app.config).toBeDefined();
		expect(app.config.server.port).toBe(DEFAULT_SERVER_CONFIG.port);
		expect(app.config.server.hostname).toBe(DEFAULT_SERVER_CONFIG.hostname);
	});

	it("should create a vitext app with custom configuration", async () => {
		const customConfig = {
			server: {
				port: 8080,
				hostname: "0.0.0.0",
			},
		};

		const app = await createVitextApp(customConfig);

		expect(app.config.server.port).toBe(8080);
		expect(app.config.server.hostname).toBe("0.0.0.0");
	});

	it("should have start and build methods", async () => {
		const app = await createVitextApp();

		expect(typeof app.start).toBe("function");
		expect(typeof app.build).toBe("function");
	});
});
