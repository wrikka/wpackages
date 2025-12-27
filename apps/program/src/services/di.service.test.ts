/**
 * Tests for the enhanced DI system
 */

import { describe, it, beforeEach, expect } from "vitest";
import { Container, inject, injectMany, provide, provideWithFactory, Service, withDeps } from "./di.service";

// Example services for testing
interface DatabaseService {
	query(sql: string): string[];
}

interface LoggerService {
	log(message: string): void;
}

// Test the enhanced DI system
describe("Enhanced DI System", () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
	});

	it("should register and retrieve simple values", () => {
		container.registerValue("apiKey", "12345");
		const apiKey = container.get<string>("apiKey");
		expect(apiKey).toBe("12345");
	});

	it("should register and retrieve factory functions", () => {
		const factory = () => ({ query: (_sql: string) => ["result1", "result2"] });
		container.register<DatabaseService>("database", factory);

		const db = container.get<DatabaseService>("database");
		expect(db.query("SELECT * FROM users")).toEqual(["result1", "result2"]);
	});

	it("should support singleton pattern", () => {
		let instanceCount = 0;
		const factory = () => {
			instanceCount++;
			return { query: (_sql: string) => ["result"] };
		};

		container.register<DatabaseService>("database", factory, { singleton: true });

		const db1 = container.get<DatabaseService>("database");
		const db2 = container.get<DatabaseService>("database");

		expect(instanceCount).toBe(1); // Only one instance created
		expect(db1).toBe(db2); // Same instance
	});

	it("should support transient pattern", () => {
		let instanceCount = 0;
		const factory = () => {
			instanceCount++;
			return { query: (_sql: string) => ["result"] };
		};

		container.register<DatabaseService>("database", factory, { singleton: false });

		const db1 = container.get<DatabaseService>("database");
		const db2 = container.get<DatabaseService>("database");

		expect(instanceCount).toBe(2); // Two instances created
		expect(db1).not.toBe(db2); // Different instances
	});

	it("should work with decorator-based service registration", () => {
		@Service("logger")
		class Logger implements LoggerService {
			log(message: string): void {
				console.log(message);
			}
		}

		const logger = inject<LoggerService>("logger");
		expect(logger).toBeInstanceOf(Logger);
	});

	it("should support provide function with scoped containers", async () => {
		const result = await provide(
			{
				"apiKey": "scoped-key",
				"region": "us-west",
			},
			async (container) => {
				const apiKey = container.get<string>("apiKey");
				const region = container.get<string>("region");
				return `${apiKey}-${region}`;
			},
		);

		expect(result).toBe("scoped-key-us-west");
	});

	it("should support provideWithFactory function with factory functions", async () => {
		const result = await provideWithFactory(
			{
				"database": () => ({ query: (_sql: string) => ["row1", "row2"] }),
				"logger": () => ({ log: (msg: string) => console.log(msg) }),
			},
			async (container) => {
				const db = container.get<DatabaseService>("database");
				return db.query("SELECT * FROM users").length;
			},
		);

		expect(result).toBe(2);
	});

	it("should support injectMany function", () => {
		container.registerValue("apiKey", "12345");
		container.registerValue("region", "us-west");

		// Register the services in the global container as well for injectMany
		container.registerValue("apiKey", "12345");
		container.registerValue("region", "us-west");

		const services = injectMany<{ apiKey: string; region: string }>({
			apiKey: "apiKey",
			region: "region",
		});

		expect(services.apiKey).toBe("12345");
		expect(services.region).toBe("us-west");
	});

	it("should support withDeps helper function", () => {
		container.registerValue("apiKey", "12345");
		container.registerValue("region", "us-west");

		// Register the services in the global container as well for withDeps
		container.registerValue("apiKey", "12345");
		container.registerValue("region", "us-west");

		const factory = withDeps(["apiKey", "region"], (deps) => {
			return `${deps.apiKey}-${deps.region}`;
		});

		container.register("config", factory);

		const config = container.get<string>("config");
		expect(config).toBe("12345-us-west");
	});

	it("should list all registered services", () => {
		container.registerValue("service1", "value1");
		container.registerValue("service2", "value2");

		const services = container.listServices();
		expect(services).toContain("service1");
		expect(services).toContain("service2");
	});
});
