import { describe, expect, it } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DiskCache } from "./disk-cache";
import type { FileNode } from "./types";

async function createTempDir(prefix: string): Promise<string> {
	return await fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("DiskCache", () => {
	it("should store and load cached entries (hit)", async () => {
		const cwd = await createTempDir("wpackages-unused-cache-");
		const cache = await DiskCache.load(cwd, ".unused-cache.json");

		const filePath = path.join(cwd, "a.ts");
		const node: FileNode = {
			path: filePath,
			imports: [{ module: "./b", specifiers: new Set(["default"]) }],
			reExports: [],
			exports: new Set(["foo"]),
		};
		cache.set(filePath, { mtimeMs: 1, size: 10 }, node);
		await cache.save();

		const cache2 = await DiskCache.load(cwd, ".unused-cache.json");
		const loaded = cache2.get(filePath, { mtimeMs: 1, size: 10 });
		expect(loaded).not.toBeUndefined();
		expect(loaded && loaded !== null ? [...loaded.exports] : []).toEqual(["foo"]);
	});

	it("should miss when meta changes", async () => {
		const cwd = await createTempDir("wpackages-unused-cache-");
		const cache = await DiskCache.load(cwd, ".unused-cache.json");

		const filePath = path.join(cwd, "a.ts");
		cache.set(filePath, { mtimeMs: 1, size: 10 }, null);
		await cache.save();

		const cache2 = await DiskCache.load(cwd, ".unused-cache.json");
		const loaded = cache2.get(filePath, { mtimeMs: 2, size: 10 });
		expect(loaded).toBeUndefined();
	});
});
