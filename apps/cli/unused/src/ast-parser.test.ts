import { describe, expect, it } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { analyzeFile } from "./ast-parser";

async function createTempFile(content: string): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpackages-unused-parser-"));
	const filePath = path.join(dir, "test.ts");
	await fs.writeFile(filePath, content, "utf-8");
	return filePath;
}

describe("analyzeFile", () => {
	it("should detect dynamic import()", async () => {
		const filePath = await createTempFile(`import('./foo');`);
		const result = await analyzeFile(filePath);
		expect(result?.imports).toEqual([{ module: "./foo", specifiers: new Set(["*"]) }]);
	});

	it("should detect require()", async () => {
		const filePath = await createTempFile(`require('./bar');`);
		const result = await analyzeFile(filePath);
		expect(result?.imports).toEqual([{ module: "./bar", specifiers: new Set(["*"]) }]);
	});

	it("should not detect require() with variable", async () => {
		const filePath = await createTempFile(`const x = './baz'; require(x);`);
		const result = await analyzeFile(filePath);
		expect(result?.imports).toEqual([]);
	});
});
