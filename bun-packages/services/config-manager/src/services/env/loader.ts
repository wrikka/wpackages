import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { EnvConfig, ParsedEnv } from "../../types/env";
import { mergeEnvs, parseEnvContent } from "../../utils";

export const loadEnvFromPaths = (
	paths: string[],
	config: EnvConfig,
): ParsedEnv => {
	const loadedEnvs: ParsedEnv[] = [];

	// Load from files
	for (const path of paths) {
		const fullPath = join(process.cwd(), path);

		if (existsSync(fullPath)) {
			const content = readFileSync(fullPath, config.encoding || "utf8");
			const parsed = parseEnvContent(content);
			loadedEnvs.push(parsed);
		}
	}

	// Merge all envs, giving precedence to later sources and process.env
	return mergeEnvs(...loadedEnvs, process.env as ParsedEnv);
};
