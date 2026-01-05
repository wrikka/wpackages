import { Elysia } from "elysia";

type BenchCase = "small" | "medium" | "large";

type CaseConfig = {
	readonly routes: number;
	readonly payloadBytes: number;
	readonly requests: number;
	readonly concurrency: number;
};

const getArgValue = (key: string): string | undefined => {
	const i = process.argv.indexOf(key);
	if (i === -1) return undefined;
	return process.argv[i + 1];
};

const parseCase = (): BenchCase => {
	const raw = getArgValue("--case") ?? "small";
	if (raw === "small" || raw === "medium" || raw === "large") return raw;
	return "small";
};

const CASES: Record<BenchCase, CaseConfig> = {
	small: { routes: 1, payloadBytes: 64, requests: 2_000, concurrency: 50 },
	medium: { routes: 50, payloadBytes: 1_024, requests: 5_000, concurrency: 100 },
	large: { routes: 300, payloadBytes: 8_192, requests: 10_000, concurrency: 100 },
};

const makePayload = (bytes: number): string => {
	if (bytes <= 0) return "";
	return "x".repeat(bytes);
};

const fetchWithRetry = async (url: string): Promise<void> => {
	let lastError: unknown;
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			const res = await fetch(url);
			await res.arrayBuffer();
			return;
		} catch (error) {
			lastError = error;
			await Bun.sleep(10 * (attempt + 1));
		}
	}
	throw lastError;
};

const waitForReady = async (url: string): Promise<void> => {
	for (let attempt = 0; attempt < 100; attempt++) {
		try {
			const res = await fetch(url);
			await res.arrayBuffer();
			return;
		} catch {
			await Bun.sleep(10 * (attempt + 1));
		}
	}
	throw new Error(`Server not ready: ${url}`);
};

const pickBasePort = (benchCase: BenchCase): number => {
	if (benchCase === "small") return 40201;
	if (benchCase === "medium") return 40202;
	return 40203;
};

const startElysiaServer = (port: number, payload: string): { readonly app: Elysia; readonly base: string } => {
	const app = new Elysia();
	app.get("/", () => payload);
	app.get("/r/:id", () => payload);
	app.listen(port);
	return { app, base: `http://127.0.0.1:${port}` };
};

const runLoad = async (url: string, requests: number, concurrency: number): Promise<void> => {
	const batches = Math.ceil(requests / concurrency);
	for (let b = 0; b < batches; b++) {
		const count = Math.min(concurrency, requests - b * concurrency);
		await Promise.all(
			Array.from({ length: count }, async () => {
				await fetchWithRetry(url);
			}),
		);
	}
};

const main = async (): Promise<void> => {
	const benchCase = parseCase();
	const config = CASES[benchCase];
	const payload = makePayload(config.payloadBytes);

	const isServerMode = process.argv.includes("--server");
	if (isServerMode) {
		const port = Number.parseInt(process.env.PORT ?? "0", 10);
		if (!Number.isFinite(port) || port <= 0) throw new Error("Invalid PORT");
		const { base } = startElysiaServer(port, payload);
		await waitForReady(`${base}/`);
		await new Promise<void>(() => {
			// keep process alive until killed by parent
		});
		return;
	}

	const basePort = pickBasePort(benchCase);
	let child: Bun.Subprocess | undefined;
	let base = "";
	for (let i = 0; i < 25; i++) {
		const port = basePort + i;
		child = Bun.spawn({
			cmd: ["bun", "./bench/sample/elysia.ts", "--case", benchCase, "--server"],
			stdin: "ignore",
			stdout: "ignore",
			stderr: "ignore",
			env: {
				...process.env,
				PORT: String(port),
			},
		});
		base = `http://127.0.0.1:${port}`;
		try {
			await waitForReady(`${base}/`);
			break;
		} catch {
			child.kill();
			await child.exited;
			child = undefined;
		}
	}
	if (!child) throw new Error("Unable to start Elysia server process");

	try {
		await runLoad(`${base}/`, config.requests, config.concurrency);
		if (config.routes > 1) {
			const routeId = config.routes - 1;
			await runLoad(`${base}/r/${routeId}`, config.requests, config.concurrency);
		}
	} finally {
		child.kill();
		await child.exited;
	}
};

await main();
