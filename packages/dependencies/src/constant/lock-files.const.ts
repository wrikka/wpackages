import type { LockFileMapping, PackageManager } from "../types/index";

/**
 * Lock file names for each package manager
 */
export const LOCK_FILES: LockFileMapping = {
	npm: "package-lock.json",
	yarn: "yarn.lock",
	pnpm: "pnpm-lock.yaml",
	bun: "bun.lockb",
	deno: "deno.lock",
} as const;

/**
 * Reverse mapping: lock file to package manager
 */
export const LOCK_FILE_TO_MANAGER: Record<string, PackageManager> = {
	"package-lock.json": "npm",
	"yarn.lock": "yarn",
	"pnpm-lock.yaml": "pnpm",
	"bun.lockb": "bun",
	"deno.lock": "deno",
} as const;

/**
 * Priority order for package manager detection
 * Higher priority = checked first
 */
export const DETECTION_PRIORITY: readonly PackageManager[] = ["bun", "pnpm", "yarn", "deno", "npm"] as const;
