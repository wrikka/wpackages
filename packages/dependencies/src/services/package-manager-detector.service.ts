import { Effect } from "effect";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DETECTION_PRIORITY, LOCK_FILE_TO_MANAGER, LOCK_FILES } from "../constant/index";
import type { PackageManager, PackageManagerDetection } from "../types/index";

/**
 * Detect package manager from lock files
 */
export function detectPackageManager(cwd: string): Effect.Effect<PackageManagerDetection, Error> {
	return Effect.sync(() => {
		// Check for lock files in priority order
		for (const manager of DETECTION_PRIORITY) {
			const lockFile = LOCK_FILES[manager];
			const lockFilePath = join(cwd, lockFile);

			if (existsSync(lockFilePath)) {
				return {
					manager,
					lockFile,
					confidence: "high" as const,
				};
			}
		}

		// Check for package.json with packageManager field
		const pkgJsonPath = join(cwd, "package.json");
		if (existsSync(pkgJsonPath)) {
			try {
				const content = Bun.file(pkgJsonPath).toString();
				const pkgJson = JSON.parse(content);
				if (pkgJson.packageManager) {
					const pmName = pkgJson.packageManager.split("@")[0] as PackageManager;
					return {
						manager: pmName,
						lockFile: LOCK_FILES[pmName],
						confidence: "medium" as const,
					};
				}
			} catch {
				// Ignore parse errors
			}
		}

		// Default to bun
		return {
			manager: "bun" as const,
			lockFile: LOCK_FILES.bun,
			confidence: "low" as const,
		};
	});
}

/**
 * Get package manager from lock file name
 */
export function getPackageManagerFromLockFile(lockFileName: string): PackageManager | undefined {
	return LOCK_FILE_TO_MANAGER[lockFileName];
}

/**
 * Check if package manager is installed
 */
export async function isPackageManagerInstalled(manager: PackageManager): Promise<boolean> {
	try {
		const proc = Bun.spawn([manager, "--version"], {
			stdout: "pipe",
			stderr: "pipe",
		});
		await proc.exited;
		return proc.exitCode === 0;
	} catch {
		return false;
	}
}
