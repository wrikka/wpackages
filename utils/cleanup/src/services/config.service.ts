import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface Profile {
	patterns: string[];
	excludePatterns: string[];
}

export interface CleanupConfig {
	profiles: Record<string, Profile>;
	scanPaths: string[];
}

const globalConfigFileName = "computer-cleanup.config.json";
const localConfigFileName = ".cleanup.config.json";
const globalConfigPath = path.join(os.homedir(), globalConfigFileName);

const defaultConfig: CleanupConfig = {
	profiles: {
		default: {
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
			excludePatterns: [
				"**/.git/**",
				"**/AppData/**",
				"**/Library/**",
				"**/.Trash/**",
				"**/$RECYCLE.BIN/**",
			],
		},
		frontend: {
			patterns: ["node_modules", "dist", ".cache", "coverage", "bun.lockb"],
			excludePatterns: ["**/.git/**"],
		},
		rust: {
			patterns: ["target", "Cargo.lock"],
			excludePatterns: ["**/.git/**"],
		},
	},
	scanPaths: [
		os.homedir(),
		path.join(os.homedir(), "Documents"),
		path.join(os.homedir(), "Downloads"),
		path.join(os.homedir(), "Desktop"),
	],
};

const readConfigFile = async (filePath: string): Promise<Partial<CleanupConfig>> => {
	try {
		const fileContent = await readFile(filePath, "utf-8");
		return JSON.parse(fileContent) as Partial<CleanupConfig>;
	} catch {
		return {}; // Return empty object if file doesn't exist or is invalid
	}
};

export const loadConfig = async (): Promise<CleanupConfig> => {
	const globalConfig = await readConfigFile(globalConfigPath);
	const localConfigPath = path.join(process.cwd(), localConfigFileName);
	const localConfig = await readConfigFile(localConfigPath);

	// Deep merge configs: default -> global -> local
	const finalConfig = { ...defaultConfig };

	const mergeProfiles = (target: Record<string, Profile>, source: Partial<Record<string, Profile>>) => {
		for (const key in source) {
			if (source[key]) {
				const targetProfile = target[key] || { patterns: [], excludePatterns: [] };
				const sourceProfile = source[key]!;
				target[key] = {
					patterns: [...new Set([...targetProfile.patterns, ...sourceProfile.patterns])],
					excludePatterns: [...new Set([...targetProfile.excludePatterns, ...sourceProfile.excludePatterns])],
				};
			}
		}
	};

	if (globalConfig.profiles) {
		mergeProfiles(finalConfig.profiles, globalConfig.profiles);
	}
	finalConfig.scanPaths = globalConfig.scanPaths || finalConfig.scanPaths;

	if (localConfig.profiles) {
		mergeProfiles(finalConfig.profiles, localConfig.profiles);
	}
	finalConfig.scanPaths = localConfig.scanPaths || finalConfig.scanPaths;

	return finalConfig;
};

export const createDefaultConfig = async (): Promise<string> => {
	await writeFile(globalConfigPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
	return globalConfigPath;
};
