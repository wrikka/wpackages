import { beforeEach, describe, expect, it } from "vitest";

import { PortService } from "./index";

describe("PortService", () => {
	let service: PortService;

	beforeEach(() => {
		service = new PortService();
	});

	it("registerPort should register open port with url", () => {
		const info = service.registerPort(3001, "localhost");

		expect(info).toEqual({
			port: 3001,
			status: "open",
			url: "http://localhost:3001",
		});
		expect(service.getPort(3001)).toEqual(info);
		expect(service.isPortOpen(3001)).toBe(true);
	});

	it("unregisterPort should mark port closed", () => {
		service.registerPort(3002, "localhost");
		service.unregisterPort(3002);

		expect(service.getPort(3002)?.status).toBe("closed");
		expect(service.isPortOpen(3002)).toBe(false);
	});

	it("findAvailablePort should return the first port that is not registered and is available", async () => {
		service.registerPort(3003, "localhost");

		const port = await service.findAvailablePort(3003);

		expect(port).toBeGreaterThanOrEqual(3004);
	});
});
