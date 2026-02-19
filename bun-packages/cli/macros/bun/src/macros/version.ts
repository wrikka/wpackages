import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Version management macro for build-time version tracking.
 * Reads version information from package.json or git.
 *
 * @param source - Version source ("package" or "commit")
 * @returns Version string or commit hash
 * @throws Error if version cannot be determined
 *
 * @example
 * // const appVersion = version() // from package.json
 * // const buildVersion = version("commit") // git commit hash
 */
export const version = Bun.macro((source: "package" | "commit" = "package") => {
	if (source === "package") {
		try {
			const packageJsonPath = resolve(import.meta.dir, "..", "..", "package.json");
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

			if (!packageJson.version) {
				throw new Error("No version found in package.json");
			}

			return JSON.stringify(packageJson.version);
		} catch (error) {
			throw new Error(
				"Failed to read package.json: " + (error instanceof Error ? error.message : String(error)),
			);
		}
	}

	if (source === "commit") {
		try {
			const { execSync } = require("child_process");
			const commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
			return JSON.stringify(commitHash);
		} catch (error) {
			throw new Error(
				"Failed to get git commit hash: " + (error instanceof Error ? error.message : String(error)),
			);
		}
	}

	throw new Error(`Invalid version source: ${source}`);
});

/**
 * Get full version information including package version and git commit.
 *
 * @returns Version information object
 *
 * @example
 * // const versionInfo = versionInfo()
 * // console.log(versionInfo.package, versionInfo.commit)
 */
export const versionInfo = Bun.macro(() => {
	const info: Record<string, string> = {};

	try {
		const packageJsonPath = resolve(import.meta.dir, "..", "..", "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		info["package"] = packageJson["version"] || "unknown";
	} catch {
		info["package"] = "unknown";
	}

	try {
		const { execSync } = require("child_process");
		info["commit"] = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
	} catch {
		info["commit"] = "unknown";
	}

	try {
		const { execSync } = require("child_process");
		info["branch"] = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
	} catch {
		info["branch"] = "unknown";
	}

	info["buildTime"] = new Date().toISOString();

	return JSON.stringify(info);
});

/**
 * Get build timestamp.
 *
 * @returns ISO timestamp string
 *
 * @example
 * // const buildTime = buildTimestamp()
 */
export const buildTimestamp = Bun.macro(() => {
	return JSON.stringify(new Date().toISOString());
});
