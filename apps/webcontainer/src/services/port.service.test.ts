import { beforeEach, describe, expect, it } from "vitest";
import { createPortService } from "./port.service";

describe("PortService", () => {
	let portService: ReturnType<typeof createPortService>;

	beforeEach(() => {
		portService = createPortService();
	});

	it("should create port service", () => {
		expect(portService).toBeDefined();
	});

	it("should register port", () => {
		const portInfo = portService.registerPort(3000);

		expect(portInfo.port).toBe(3000);
		expect(portInfo.url).toBe("http://localhost:3000");
		expect(portInfo.status).toBe("open");
	});

	it("should register port with custom hostname", () => {
		const portInfo = portService.registerPort(8080, "127.0.0.1");

		expect(portInfo.port).toBe(8080);
		expect(portInfo.url).toBe("http://127.0.0.1:8080");
		expect(portInfo.status).toBe("open");
	});

	it("should get port info", () => {
		portService.registerPort(3000);
		const portInfo = portService.getPort(3000);

		expect(portInfo).toBeDefined();
		expect(portInfo?.port).toBe(3000);
	});

	it("should return undefined for non-existent port", () => {
		const portInfo = portService.getPort(9999);
		expect(portInfo).toBeUndefined();
	});

	it("should get all ports", () => {
		portService.registerPort(3000);
		portService.registerPort(3001);
		portService.registerPort(3002);

		const ports = portService.getAllPorts();
		expect(ports).toHaveLength(3);
	});

	it("should unregister port", () => {
		portService.registerPort(3000);
		portService.unregisterPort(3000);

		const portInfo = portService.getPort(3000);
		expect(portInfo?.status).toBe("closed");
	});

	it("should check if port is open", () => {
		portService.registerPort(3000);

		expect(portService.isPortOpen(3000)).toBe(true);
		expect(portService.isPortOpen(9999)).toBe(false);
	});

	it("should get only open ports", () => {
		portService.registerPort(3000);
		portService.registerPort(3001);
		portService.registerPort(3002);

		portService.unregisterPort(3001);

		const openPorts = portService.getOpenPorts();
		expect(openPorts).toHaveLength(2);
		expect(openPorts.every((p) => p.status === "open")).toBe(true);
	});

	it("should find available port", async () => {
		portService.registerPort(3000);
		portService.registerPort(3001);

		const availablePort = await portService.findAvailablePort(3000);
		expect(availablePort).toBe(3002);
	});

	it("should find available port from start", async () => {
		const availablePort = await portService.findAvailablePort(5000);
		expect(availablePort).toBe(5000);
	});

	it("should clear all ports", () => {
		portService.registerPort(3000);
		portService.registerPort(3001);

		portService.clear();

		const ports = portService.getAllPorts();
		expect(ports).toHaveLength(0);
	});
});
