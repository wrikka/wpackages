import { type ChildProcess, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const port = 30_000 + Math.floor(Math.random() * 10_000);
const BASE_URL = `http://localhost:${port}`;

const waitForServer = async (getLogs: () => string) => {
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
	throw new Error(`Server did not start in time\n\nLogs:\n${getLogs()}`);
};

describe("Server", () => {
	let proc: null | ChildProcess = null;
	let logs = "";
	const apiKey = "test-api-key";

	beforeAll(async () => {
		const testDir = dirname(fileURLToPath(import.meta.url));
		const projectRoot = resolve(testDir, "..");
		proc = spawn("bun", ["run", "dev"], {
			cwd: projectRoot,
			env: {
				...process.env,
				PORT: String(port),
				TEST_MODE: "1",
				API_KEY: apiKey,
				RATE_LIMIT_MAX: "2",
				RATE_LIMIT_WINDOW_MS: "60000",
			},
			stdio: ["ignore", "pipe", "pipe"],
		});

		proc.stdout?.on("data", (chunk) => {
			logs += chunk.toString();
		});
		proc.stderr?.on("data", (chunk) => {
			logs += chunk.toString();
		});

		proc.on("exit", (code) => {
			logs += `\n[process exited] code=${code ?? "null"}`;
		});

		await waitForServer(() => logs);
	}, 30_000);

	afterAll(() => {
		proc?.kill();
		proc = null;
	});

	it("should return 200 on /", async () => {
		const response = await fetch(`${BASE_URL}/`);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("Hello World");
	});

	it("should return JSON on /users/:id", async () => {
		const response = await fetch(`${BASE_URL}/users/1`, {
			headers: {
				"x-api-key": apiKey,
				"x-forwarded-for": "203.0.113.10",
			},
		});
		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ user: { id: 1, name: "John Doe" } });
	});

	it("should return 401 on /users/:id when API key missing", async () => {
		const response = await fetch(`${BASE_URL}/users/1`, {
			headers: {
				"x-forwarded-for": "203.0.113.11",
			},
		});
		expect(response.status).toBe(401);
	});

	it("should return 429 when rate limit exceeded", async () => {
		const url = `${BASE_URL}/users/1`;
		const headers = { "x-api-key": apiKey, "x-forwarded-for": "203.0.113.12" };

		const res1 = await fetch(url, { headers });
		expect(res1.status).toBe(200);
		const res2 = await fetch(url, { headers });
		expect(res2.status).toBe(200);
		const res3 = await fetch(url, { headers });
		expect(res3.status).toBe(429);
	});

	it("should return 404 on unknown route", async () => {
		const response = await fetch(`${BASE_URL}/not-found`);
		expect(response.status).toBe(404);
	});
});
