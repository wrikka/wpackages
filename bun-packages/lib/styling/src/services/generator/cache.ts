import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ResolvedOptions } from "../../config";

const CACHE_VERSION = "3";

export function getCacheKey(options: ResolvedOptions, classString: string): string {
	const hash = createHash("sha256");
	hash.update(CACHE_VERSION);
	hash.update(classString);
	hash.update(
		JSON.stringify({
			darkMode: options.darkMode,
			theme: options.theme,
			icons: options.icons,
			fonts: options.fonts,
			minify: options.minify,
		}),
	);
	return hash.digest("hex");
}

export async function readDiskCache(options: ResolvedOptions, key: string): Promise<string | null> {
	if (!options.cache?.enabled) return null;
	const dir = options.cache.dir ?? join(options.root, ".styling-cache");
	const filePath = join(dir, `${key}.css`);
	try {
		return await readFile(filePath, "utf-8");
	} catch {
		return null;
	}
}

export async function writeDiskCache(options: ResolvedOptions, key: string, css: string): Promise<void> {
	if (!options.cache?.enabled) return;
	const dir = options.cache.dir ?? join(options.root, ".styling-cache");
	const filePath = join(dir, `${key}.css`);
	try {
		await mkdir(dir, { recursive: true });
		await writeFile(filePath, css);
	} catch {
		// ignore cache write errors
	}
}
