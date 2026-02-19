import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Resource } from "../models/resource";

async function findPackageJson(startDir: string): Promise<string | undefined> {
	let currentDir = startDir;
	while (true) {
		const filePath = resolve(currentDir, "package.json");
		try {
			await readFile(filePath); // Check if file exists and is readable
			return filePath;
		} catch {
			const parentDir = dirname(currentDir);
			if (parentDir === currentDir) {
				return undefined; // Reached the root
			}
			currentDir = parentDir;
		}
	}
}

/**
 * Detects the default resource attributes by finding and parsing the nearest package.json.
 * @returns A Resource instance with service.name and service.version, or an empty Resource if not found.
 */
export async function detectDefaultResource(): Promise<Resource> {
	try {
		const packageJsonPath = await findPackageJson(process.cwd());
		if (!packageJsonPath) {
			return new Resource({});
		}

		const content = await readFile(packageJsonPath, "utf-8");
		const json = JSON.parse(content);

		const attributes: Record<string, unknown> = {};
		if (typeof json.name === "string") {
			attributes["service.name"] = json.name;
		}
		if (typeof json.version === "string") {
			attributes["service.version"] = json.version;
		}

		return new Resource(attributes);
	} catch (error) {
		console.error("Failed to detect default resource:", error);
		return new Resource({});
	}
}
