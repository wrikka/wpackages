import type { Infer } from "@wpackages/schema";
import { exists } from "fs/promises";
import { dirname, join } from "path";
import { configSchema } from "../config/schema";
import { ConsoleService } from "./console.service";

export type BenchConfigFile = Infer<typeof configSchema>;

const findUp = async (filename: string, cwd: string): Promise<string | null> => {
	let currentDir = cwd;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const filePath = join(currentDir, filename);
		if (await exists(filePath)) {
			return filePath;
		}
		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) {
			return null; // Reached the root
		}
		currentDir = parentDir;
	}
};

export const loadConfig = async (configPath?: string): Promise<Partial<BenchConfigFile>> => {
	const filePath = configPath ?? await findUp("bench.json", process.cwd());

	if (!filePath) {
		return {};
	}

	try {
		const fileContent = await Bun.file(filePath).text();
		const configJson = JSON.parse(fileContent);

		const result = configSchema.parse(configJson);

		if (!result.success) {
			await ConsoleService.warn(`Warning: Invalid configuration in ${filePath}`);
			for (const issue of result.issues) {
				await ConsoleService.warn(`  - ${issue.path.join(".")}: ${issue.message}`);
			}
			return {};
		}

		return result.data;
	} catch (error) {
		if (error instanceof Error) {
			await ConsoleService.error(`Error loading config file ${filePath}: ${error.message}`);
		}
		return {};
	}
};
