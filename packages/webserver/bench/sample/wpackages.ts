import { spawn, Subprocess } from "bun";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string): Promise<void> => {
	let lastError: unknown;
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			const res = await fetch(url);
			await res.arrayBuffer();
			return;
		} catch (error) {
			lastError = error;
			await sleep(10 * (attempt + 1));
		}
	}
	throw lastError;
};

const waitForReady = async (url: string, timeoutMs: number): Promise<void> => {
	const startedAt = Date.now();
	let lastError: unknown;
	let attempt = 0;
	while (Date.now() - startedAt < timeoutMs) {
		attempt++;
		try {
			const res = await fetch(url);
			await res.arrayBuffer();
			return;
		} catch (e) {
			lastError = e;
			await sleep(Math.min(250, 10 * attempt));
		}
	}
	throw new Error(`Server not ready: ${url}${lastError ? `\nLast error: ${String(lastError)}` : ""}`);
};

const pickBasePort = (benchCase: BenchCase): number => {
	if (benchCase === "small") return 40101;
	if (benchCase === "medium") return 40102;
	return 40103;
};

const isBenchDebug = (): boolean => {
	return process.env["BENCH_DEBUG"] === "1" || process.env["BENCH_DEBUG"] === "true";
};

const readStreamToString = (stream: ReadableStream<Uint8Array>, append: (text: string) => void): void => {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	void (async () => {
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				append(decoder.decode(value, { stream: true }));
			}
			append(decoder.decode());
		} catch {
			// ignore
		}
	})();
};

const startWebserverProcess = (port: number): {
	readonly proc: Subprocess;
	readonly getLogs: () => string;
	readonly getExitCode: () => number | null;
} => {
	const debug = isBenchDebug();
	let logs = "";
	let exitCode: number | null = null;
	const proc = spawn({
		cmd: ["bun", "./src/index.ts"],
		stdin: "ignore",
		stdout: debug ? "inherit" : "pipe",
		stderr: debug ? "inherit" : "pipe",
		env: {
			...process.env,
			PORT: String(port),
			PAYLOAD_BYTES: String(process.env["PAYLOAD_BYTES"] ?? "0"),
			ENABLE_HTTP_LOGGER: "false",
			ENABLE_METRICS: "false",
			ENABLE_TRACING: "false",
			ENABLE_CORS: "false",
			ENABLE_AUTH: "false",
			ENABLE_RATE_LIMIT: "false",
			ENABLE_SECURITY_HEADERS: "false",
			ENABLE_QUERY_PARSER: "false",
			ENABLE_BODY_LIMIT: "false",
			TEST_MODE: "1",
		},
	});

	if (!debug) {
		if (proc.stdout) {
			readStreamToString(proc.stdout, (t) => {
				logs += t;
			});
		}
		if (proc.stderr) {
			readStreamToString(proc.stderr, (t) => {
				logs += t;
			});
		}
	}

	void proc.exited.then((code) => {
		exitCode = code;
	}).catch(() => {
		exitCode = -1;
	});

	return { proc, getLogs: () => logs, getExitCode: () => exitCode };
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
	void makePayload(config.payloadBytes);

	const basePort = pickBasePort(benchCase);
	let child: {
		readonly proc: Subprocess;
		readonly getLogs: () => string;
		readonly getExitCode: () => number | null;
	} | undefined;
	let base = "";
	let lastStartError: unknown;
	let lastLogs = "";
	for (let i = 0; i < 25; i++) {
		const port = basePort + i;
		child = startWebserverProcess(port);
		base = `http://127.0.0.1:${port}`;
		try {
			await waitForReady(`${base}/`, 10_000);
			break;
		} catch (e) {
			lastStartError = e;
			lastLogs = child.getLogs();
			if (child) {
				child.proc.kill();
				await child.proc.exited;
			}
			child = undefined;
		}
	}
	if (!child) {
		throw new Error(
			`Unable to start @wpackages/webserver process${lastStartError ? `\n${String(lastStartError)}` : ""}${
				lastLogs ? `\n\nLogs:\n${lastLogs}` : ""
			}`,
		);
	}

	try {
		await runLoad(`${base}/`, config.requests, config.concurrency);
		if (config.routes > 1) {
			const routeId = config.routes - 1;
			await runLoad(`${base}/r/${routeId}`, config.requests, config.concurrency);
		}
	} finally {
		if (child) {
			child.proc.kill();
			await child.proc.exited;
		}
	}
};

await main();
