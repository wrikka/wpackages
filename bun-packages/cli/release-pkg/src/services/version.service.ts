import { join } from "node:path";
import type { ReleaseType, VersionBump } from "../types/index";
import { getCurrentPackageJson, writeJsonFile } from "../utils/file-system";
import { incrementVersion, isValidVersion } from "../utils/semver";

export class VersionService {
	async getCurrentVersion(): Promise<string> {
		try {
			const packageJson = await getCurrentPackageJson();
			const version = (packageJson["version"] as string) || "0.0.0";

			if (!isValidVersion(version)) {
				throw new Error(`Invalid version in package.json: ${version}`);
			}

			return version;
		} catch (error) {
			if (error instanceof Error && error.message.includes("Invalid version")) {
				throw error;
			}
			throw new Error(
				`Failed to read package.json: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async bumpVersion(type: ReleaseType, preid?: string): Promise<VersionBump> {
		const currentVersion = await this.getCurrentVersion();
		const newVersion = incrementVersion(currentVersion, type, preid);

		return {
			from: currentVersion,
			to: newVersion,
			type,
		};
	}

	async updatePackageJson(version: string): Promise<void> {
		if (!isValidVersion(version)) {
			throw new Error(`Invalid version: ${version}`);
		}

		try {
			const packageJson = await getCurrentPackageJson();
			packageJson["version"] = version;
			await writeJsonFile(join(process.cwd(), "package.json"), packageJson);
		} catch (error) {
			throw new Error(
				`Failed to update package.json: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async getPackageInfo(): Promise<{ name: string; version: string }> {
		try {
			const packageJson = await getCurrentPackageJson();

			if (!packageJson["name"]) {
				throw new Error("package.json is missing 'name' field");
			}

			return {
				name: packageJson["name"] as string,
				version: (packageJson["version"] as string) || "0.0.0",
			};
		} catch (error) {
			if (
				error instanceof Error
				&& error.message.includes("package.json")
			) {
				throw error;
			}
			throw new Error(
				`Failed to read package.json: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
