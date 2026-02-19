import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { WTestConfig } from "../types";

const DEFAULT_CONFIG: WTestConfig = {
	testMatch: ["src/**/*.test.ts"],
};

export async function loadConfig(cwd: string): Promise<WTestConfig> {
	const configPath = path.join(cwd, "wtest.config.ts");

	if (fs.existsSync(configPath)) {
		try {
			const configModule = await import(pathToFileURL(configPath).href);
			return { ...DEFAULT_CONFIG, ...configModule.default };
		} catch (error) {
			console.error("Error loading wtest.config.ts:", error);
			return DEFAULT_CONFIG;
		}
	}

	return DEFAULT_CONFIG;
}
