import { type ChildProcess, spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("WebServer Integration Tests", () => {
	let server: ChildProcess;
	let logs = "";
	const port = 30_000 + Math.floor(Math.random() * 10_000);
	const BASE_URL = `http://localhost:${port}`;

	const waitForServer = async () => {
		const startedAt = Date.now();
		while (Date.now() - startedAt < 10_000) {
			try {
				const res = await fetch(`${BASE_URL}/`);
				if (res.status === 200) return;
			} catch {
				// ignore until ready
			}
			await new Promise((r) => setTimeout(r, 100));
		}
		throw new Error(`Server did not start in time\n\nLogs:\n${logs}`);
	};

	beforeAll(async () => {
		server = spawn("bun", ["run", "src/index.ts"], {
			stdio: "pipe",
			env: {
				...process.env,
				TEST_MODE: "1",
				PORT: String(port),
				RATE_LIMIT_MAX: "1000000",
				RATE_LIMIT_WINDOW_MS: "60000",
			},
		});

		server.stdout?.on("data", (chunk) => {
			logs += chunk.toString();
		});
		server.stderr?.on("data", (chunk) => {
			logs += chunk.toString();
		});

		await waitForServer();
	}, 30_000);

	afterAll(() => {
		server.kill();
	});

	it("GET / returns Hello World", async () => {
		const response = await fetch(`${BASE_URL}/`);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("Hello World");
	});

	it("GET /healthz returns ok", async () => {
		const response = await fetch(`${BASE_URL}/healthz`);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ ok: true });
	});

	it("GET /readyz returns ready with db disabled", async () => {
		const response = await fetch(`${BASE_URL}/readyz`);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ ready: true, db: "disabled" });
	});

	it("GET /users/1 returns user", async () => {
		const response = await fetch(`${BASE_URL}/users/1`);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ user: { id: 1, name: "John Doe" } });
	});

	it("GET /users/999 returns 404", async () => {
		const response = await fetch(`${BASE_URL}/users/999`);
		expect(response.status).toBe(404);
		const text = await response.text();
		expect(text).toBe("User not found");
	});

	it("GET /docs returns HTML documentation", async () => {
		const response = await fetch(`${BASE_URL}/docs`);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain("WebServer API Documentation");
	});

	it("GET /openapi.json returns OpenAPI spec", async () => {
		const response = await fetch(`${BASE_URL}/openapi.json`);
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toHaveProperty("openapi");
		expect(json).toHaveProperty("paths");
		expect(json.openapi).toBe("3.0.3");
	});

	it("GET /r/:id returns payload", async () => {
		const response = await fetch(`${BASE_URL}/r/123`);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("");
	});

	it("Missing API key returns 200 (auth disabled)", async () => {
		const response = await fetch(`${BASE_URL}/users/1`);
		expect(response.status).toBe(200);
	});
});
