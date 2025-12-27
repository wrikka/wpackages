/**
 * Tests for file system service
 */

import { Effect } from "effect";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { makeFileSystemService } from "./file-system.service";

describe("FileSystemService", () => {
	const service = makeFileSystemService();

	it("should read directory", async () => {
		const testDir = join(tmpdir(), `wtslint-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
		await writeFile(join(testDir, "test.ts"), "const x = 1;");

		const entries = await Effect.runPromise(service.readdir(testDir));

		expect(entries).toHaveLength(1);
		expect(entries[0]?.name).toBe("test.ts");

		await rm(testDir, { recursive: true, force: true });
	});

	it("should read file content", async () => {
		const testDir = join(tmpdir(), `wtslint-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
		const testFile = join(testDir, "test.ts");
		const content = "const hello = 'world';";
		await writeFile(testFile, content);

		const result = await Effect.runPromise(service.readFile(testFile));

		expect(result).toBe(content);

		await rm(testDir, { recursive: true, force: true });
	});

	it("should handle non-existent directory", async () => {
		const program = service.readdir("/non/existent/path");

		await expect(Effect.runPromise(program)).rejects.toThrow("Failed to read directory");
	});

	it("should handle non-existent file", async () => {
		const program = service.readFile("/non/existent/file.ts");

		await expect(Effect.runPromise(program)).rejects.toThrow("Failed to read file");
	});

	it("should return Dirent objects with file types", async () => {
		const testDir = join(tmpdir(), `wtslint-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
		await mkdir(join(testDir, "subdir"));
		await writeFile(join(testDir, "file.ts"), "");

		const entries = await Effect.runPromise(service.readdir(testDir));

		const fileEntry = entries.find((e) => e.name === "file.ts");
		const dirEntry = entries.find((e) => e.name === "subdir");

		expect(fileEntry?.isFile()).toBe(true);
		expect(dirEntry?.isDirectory()).toBe(true);

		await rm(testDir, { recursive: true, force: true });
	});
});
