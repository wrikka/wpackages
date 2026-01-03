import { execa } from "execa";
import { glob } from "glob";
import { join } from "node:path";
import { fileExists, readPackageJson, readTextFile } from "../utils/file-system";

export interface MonorepoPackage {
	name: string;
	version: string;
	path: string;
	private: boolean;
}

export interface MonorepoConfig {
	packages: string[];
	tool: "pnpm" | "yarn" | "npm" | "bun" | "turborepo";
}

export class MonorepoService {
	/**
	 * Detect if current project is a monorepo
	 */
	async isMonorepo(): Promise<boolean> {
		try {
			const packageJson = await readPackageJson(process.cwd());

			// Check for workspaces
			if (packageJson["workspaces"]) {
				return true;
			}

			// Check for pnpm-workspace.yaml
			if (await fileExists(join(process.cwd(), "pnpm-workspace.yaml"))) {
				return true;
			}

			// Check for lerna.json
			if (await fileExists(join(process.cwd(), "lerna.json"))) {
				return true;
			}

			return false;
		} catch {
			return false;
		}
	}

	/**
	 * Get monorepo configuration
	 */
	async getConfig(): Promise<MonorepoConfig | null> {
		try {
			const packageJson = await readPackageJson(process.cwd());

			// Detect tool
			let tool: MonorepoConfig["tool"] = "npm";

			if (await fileExists(join(process.cwd(), "pnpm-lock.yaml"))) {
				tool = "pnpm";
			} else if (await fileExists(join(process.cwd(), "yarn.lock"))) {
				tool = "yarn";
			} else if (await fileExists(join(process.cwd(), "bun.lockb"))) {
				tool = "bun";
			} else if (await fileExists(join(process.cwd(), "turbo.json"))) {
				tool = "turborepo";
			}

			// Get packages patterns
			let packages: string[] = [];

			if (packageJson["workspaces"]) {
				const workspaces = packageJson["workspaces"];
				packages = Array.isArray(workspaces)
					? (workspaces as string[])
					: ((workspaces as Record<string, unknown>)["packages"] as string[]) || [];
			} else {
				// Check pnpm-workspace.yaml
				try {
					const pnpmWorkspace = await readTextFile(
						join(process.cwd(), "pnpm-workspace.yaml"),
					);
					// Simple YAML parsing for packages
					const match = pnpmWorkspace.match(/packages:\s*\n((?:\s+-\s+.+\n?)+)/);
					if (match && match[1]) {
						packages = match[1]
							.split("\n")
							.map((line) => line.trim().replace(/^-\s+/, ""))
							.filter(Boolean);
					}
				} catch {
					// No pnpm workspace
				}
			}

			return { packages, tool };
		} catch {
			return null;
		}
	}

	/**
	 * Get all packages in monorepo
	 */
	async getPackages(): Promise<MonorepoPackage[]> {
		const config = await this.getConfig();
		if (!config) {
			return [];
		}

		const packages: MonorepoPackage[] = [];

		for (const pattern of config.packages) {
			const paths = await glob(pattern, {
				cwd: process.cwd(),
				absolute: false,
			});

			for (const packagePath of paths) {
				try {
					const fullPath = join(process.cwd(), packagePath);
					const packageJson = await readPackageJson(fullPath);

					packages.push({
						name: packageJson["name"] as string,
						version: (packageJson["version"] as string) || "0.0.0",
						path: packagePath,
						private: (packageJson["private"] as boolean) || false,
					});
				} catch {
					// Skip invalid packages
				}
			}
		}

		return packages;
	}

	/**
	 * Get changed packages since last commit
	 */
	async getChangedPackages(since = "HEAD~1"): Promise<MonorepoPackage[]> {
		const allPackages = await this.getPackages();

		try {
			const result = await execa("git", [
				"diff",
				"--name-only",
				since,
				"HEAD",
			], {
				reject: false,
			});

			const changedFiles = result.stdout.split("\n").filter(Boolean);
			const changedPackages = new Set<string>();

			for (const file of changedFiles) {
				for (const pkg of allPackages) {
					if (file.startsWith(pkg.path)) {
						changedPackages.add(pkg.name);
					}
				}
			}

			return allPackages.filter((pkg) => changedPackages.has(pkg.name));
		} catch {
			return [];
		}
	}
}
