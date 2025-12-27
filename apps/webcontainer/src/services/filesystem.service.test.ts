import { mkdir, rm } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileSystemService } from "./filesystem.service";

const TEST_DIR = "./test-fs";

describe("FileSystemService", () => {
	beforeEach(async () => {
		await mkdir(TEST_DIR, { recursive: true });
	});

	afterEach(async () => {
		await rm(TEST_DIR, { force: true, recursive: true });
	});

	it("should create filesystem service", () => {
		const fs = createFileSystemService(TEST_DIR);
		expect(fs).toBeDefined();
	});

	it("should write and read file", async () => {
		const fs = createFileSystemService(TEST_DIR);
		const content = "Hello, World!";

		await fs.writeFile("test.txt", content);
		const result = await fs.readFile("test.txt");

		expect(result).toBe(content);
	});

	it("should check if file exists", async () => {
		const fs = createFileSystemService(TEST_DIR);

		await fs.writeFile("exists.txt", "content");

		expect(await fs.exists("exists.txt")).toBe(true);
		expect(await fs.exists("not-exists.txt")).toBe(false);
	});

	it("should delete file", async () => {
		const fs = createFileSystemService(TEST_DIR);

		await fs.writeFile("delete-me.txt", "content");
		expect(await fs.exists("delete-me.txt")).toBe(true);

		await fs.deleteFile("delete-me.txt");
		expect(await fs.exists("delete-me.txt")).toBe(false);
	});

	it("should copy file", async () => {
		const fs = createFileSystemService(TEST_DIR);
		const content = "Copy this!";

		await fs.writeFile("source.txt", content);
		await fs.copyFile("source.txt", "destination.txt");

		const copied = await fs.readFile("destination.txt");
		expect(copied).toBe(content);
	});

	it("should move file", async () => {
		const fs = createFileSystemService(TEST_DIR);
		const content = "Move this!";

		await fs.writeFile("old.txt", content);
		await fs.moveFile("old.txt", "new.txt");

		expect(await fs.exists("old.txt")).toBe(false);
		expect(await fs.exists("new.txt")).toBe(true);

		const moved = await fs.readFile("new.txt");
		expect(moved).toBe(content);
	});

	it("should list files", async () => {
		const fs = createFileSystemService(TEST_DIR);

		await fs.writeFile("file1.txt", "content1");
		await fs.writeFile("file2.txt", "content2");
		await fs.createDirectory("subdir");

		const files = await fs.listFiles();

		expect(files).toHaveLength(3);
		expect(files.some((f) => f.name === "file1.txt")).toBe(true);
		expect(files.some((f) => f.name === "file2.txt")).toBe(true);
		expect(files.some((f) => f.name === "subdir" && f.isDirectory)).toBe(true);
	});

	it("should create directory", async () => {
		const fs = createFileSystemService(TEST_DIR);

		await fs.createDirectory("new-dir");
		expect(await fs.exists("new-dir")).toBe(true);
	});

	it("should delete directory", async () => {
		const fs = createFileSystemService(TEST_DIR);

		await fs.createDirectory("delete-dir");
		expect(await fs.exists("delete-dir")).toBe(true);

		await fs.deleteDirectory("delete-dir");
		expect(await fs.exists("delete-dir")).toBe(false);
	});
});
