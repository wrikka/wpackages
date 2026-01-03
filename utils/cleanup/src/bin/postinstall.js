import { access, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const configFileName = "computer-cleanup.config.json";
const configPath = path.join(os.homedir(), configFileName);

const defaultConfig = {
	patterns: [
		"node_modules",
		"dist",
		"build",
		"coverage",
		".turbo",
		".cache",
		"bun.lockb",
		"pnpm-lock.yaml",
		"yarn.lock",
		"package-lock.json",
		"*.log",
		"npm-debug.log*",
		"yarn-debug.log*",
		"yarn-error.log*",
		".DS_Store",
		"Thumbs.db",
		".vscode",
		".idea",
		"target",
		"__pycache__",
		"*.class",
		"*.o",
		"*.obj",
	],
	scanPaths: [
		os.homedir(),
		path.join(os.homedir(), "Documents"),
		path.join(os.homedir(), "Downloads"),
		path.join(os.homedir(), "Desktop"),
	],
	excludePatterns: [
		"**/node_modules/**",
		"**/.git/**",
		"**/AppData/**",
		"**/Library/**",
		"**/.Trash/**",
		"**/$RECYCLE.BIN/**",
		"**/Dropbox/**",
		"**/OneDrive/**",
		"**/iCloudDrive/**",
	],
};

async function createConfigIfNotExists() {
	try {
		await access(configPath);
		// console.log('Config file already exists. Skipping creation.');
	} catch {
		console.log("Config file not found. Creating default config...");
		try {
			await writeFile(
				configPath,
				JSON.stringify(defaultConfig, null, 2),
				"utf-8",
			);
			console.log(`✅ Default configuration created at: ${configPath}`);
		} catch (writeError) {
			console.error("Failed to create configuration file:", writeError);
		}
	}
}

createConfigIfNotExists();
