import path from "node:path";
import os from "node:os";
import { readFile, writeFile } from "node:fs/promises";

export interface CleanupConfig {
	patterns: string[];
	scanPaths: string[];
	excludePatterns: string[];
}

const configFileName = "computer-cleanup.config.json";
const configPath = path.join(os.homedir(), configFileName);

const defaultConfig: CleanupConfig = {
	patterns: [
		// General dev artifacts
		"node_modules",
		"dist",
		"build",
		"coverage",
		".turbo",
		".cache",

		// Lock files
		"bun.lockb",
		"pnpm-lock.yaml",
		"yarn.lock",
		"package-lock.json",

		// Log files
		"*.log",
		"npm-debug.log*",
		"yarn-debug.log*",
		"yarn-error.log*",

		// OS specific
		".DS_Store",
		"Thumbs.db",

		// IDE/Editor directories
		".vscode",
		".idea",

		// Compiled code from other languages
		"target", // Rust
		"__pycache__", // Python
		"*.class", // Java
		"*.o", // C/C++ object files
		"*.obj", // Windows object files
	],
	scanPaths: [
		os.homedir(),
		path.join(os.homedir(), "Documents"),
		path.join(os.homedir(), "Downloads"),
		path.join(os.homedir(), "Desktop"),
	],
	excludePatterns: [
		"**/node_modules/**", // Already handled by default ignore, but good to be explicit
		"**/.git/**",
		"**/AppData/**",
		"**/Library/**",
		"**/.Trash/**",
		"**/$RECYCLE.BIN/**",
		// Cloud storage can be slow to scan
		"**/Dropbox/**",
		"**/OneDrive/**",
		"**/iCloudDrive/**",
	],
};

export const loadConfig = async (): Promise<CleanupConfig> => {
	try {
		const fileContent = await readFile(configPath, "utf-8");
		const userConfig = JSON.parse(fileContent) as Partial<CleanupConfig>;
		// Merge default and user patterns, removing duplicates
		const allPatterns = [
			...new Set([...defaultConfig.patterns, ...(userConfig.patterns || [])]),
		];
		// User-defined scanPaths will override the default
		const scanPaths =
			userConfig.scanPaths && userConfig.scanPaths.length > 0
				? userConfig.scanPaths
				: defaultConfig.scanPaths;
		const allExcludePatterns = [
			...new Set([
				...defaultConfig.excludePatterns,
				...(userConfig.excludePatterns || []),
			]),
		];
		return {
			...defaultConfig,
			...userConfig,
			patterns: allPatterns,
			scanPaths,
			excludePatterns: allExcludePatterns,
		};
	} catch {
		// If we can't read a directory, assume size is 0 and log the error.
		// If the file doesn't exist or is invalid, return the default config
		return defaultConfig;
	}
};

export const createDefaultConfig = async (): Promise<string> => {
	await writeFile(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
	return configPath;
};
