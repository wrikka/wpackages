import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BunpackConfig } from "../types";

interface CacheMeta {
	hash: string;
	createdAtMs: number;
}

function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	const obj = value as Record<string, unknown>;
	const keys = Object.keys(obj).sort();
	return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

async function safeReadFile(filePath: string): Promise<string> {
	try {
		return await readFile(filePath, "utf8");
	} catch {
		return "";
	}
}

export async function computeBuildHash(cwd: string, config: BunpackConfig): Promise<string> {
	const crypto = await import("node:crypto");
	const fs = await import("node:fs/promises");
	const path = await import("node:path");

	const entries = Array.isArray(config.entry)
		? config.entry
		: [config.entry].filter((e): e is string => e !== undefined);
	const entryFiles = entries.map(e => path.resolve(cwd, e));

	const stamps: string[] = [];
	for (const file of entryFiles) {
		try {
			const stat = await fs.stat(file);
			stamps.push(`${file}:${stat.mtimeMs}:${stat.size}`);
		} catch {
			// If file doesn't exist, skip it (will cause rebuild)
		}
	}

	const configJson = stableStringify({
		outDir: config.outDir,
		format: config.format,
		target: config.target,
		clean: config.clean,
		sourcemap: config.sourcemap,
		minify: config.minify,
		dts: config.dts,
		bin: config.bin,
		external: config.external,
		env: config.env,
		define: config.define,
	});

	const data = stamps.join("|") + configJson;
	return crypto.createHash("sha256").update(data).digest("hex");
}

export async function loadCacheHash(cacheDir: string): Promise<string | null> {
	const metaPath = path.join(cacheDir, "meta.json");
	const raw = await safeReadFile(metaPath);
	if (!raw) return null;
	try {
		const meta = JSON.parse(raw) as CacheMeta;
		return meta.hash;
	} catch {
		return null;
	}
}

export async function saveCacheHash(cacheDir: string, hash: string): Promise<void> {
	await mkdir(cacheDir, { recursive: true });
	const meta: CacheMeta = { hash, createdAtMs: Date.now() };
	await writeFile(path.join(cacheDir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}
