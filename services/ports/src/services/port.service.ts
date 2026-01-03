import type { PortInfo } from "../types/port";

import { isTcpPortAvailable } from "./tcp-port-availability.service";

export class PortService {
	private readonly ports = new Map<number, PortInfo>();

	registerPort(port: number, hostname: string = "localhost"): PortInfo {
		const portInfo: PortInfo = {
			port,
			status: "open",
			url: `http://${hostname}:${port}`,
		};
		this.ports.set(port, portInfo);
		return portInfo;
	}

	unregisterPort(port: number): void {
		const portInfo = this.ports.get(port);
		if (portInfo) {
			this.ports.set(port, { ...portInfo, status: "closed" });
		}
	}

	getPort(port: number): PortInfo | undefined {
		return this.ports.get(port);
	}

	getAllPorts(): PortInfo[] {
		return Array.from(this.ports.values());
	}

	getOpenPorts(): PortInfo[] {
		return Array.from(this.ports.values()).filter((p) => p.status === "open");
	}

	isPortOpen(port: number): boolean {
		const portInfo = this.ports.get(port);
		return portInfo?.status === "open" || false;
	}

	async findAvailablePort(startPort: number = 3000): Promise<number> {
		let port = startPort;
		while (this.isPortOpen(port) || !(await isTcpPortAvailable(port, "0.0.0.0"))) {
			port++;
			if (port > 65535) {
				throw new Error("No available ports");
			}
		}
		return port;
	}

	clear(): void {
		this.ports.clear();
	}
}

export const createPortService = (): PortService => new PortService();
