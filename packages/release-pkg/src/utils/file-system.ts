import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Read and parse package.json from a directory
 */
export async function readPackageJson(dir: string): Promise<Record<string, unknown>> {
	const content = await readFile(join(dir, "package.json"), "utf-8");
	return JSON.parse(content) as Record<string, unknown>;
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
	try {
		await readFile(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Read JSON file from path
 */
export async function readJsonFile<T>(path: string): Promise<T> {
	const content = await readFile(path, "utf-8");
	return JSON.parse(content) as T;
}

/**
 * Write JSON file to path
 */
export async function writeJsonFile<T>(path: string, data: T): Promise<void> {
	await writeFile(path, JSON.stringify(data, null, 2) + "\n");
}

/**
 * Read text file from path
 */
export async function readTextFile(path: string): Promise<string> {
	return readFile(path, "utf-8");
}

/**
 * Write text file to path
 */
export async function writeTextFile(path: string, content: string): Promise<void> {
	await writeFile(path, content);
}

/**
 * Get current working directory package.json
 */
export async function getCurrentPackageJson(): Promise<Record<string, unknown>> {
	return readPackageJson(process.cwd());
}
