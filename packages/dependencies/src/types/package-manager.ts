/**
 * Supported package managers
 */
export const PACKAGE_MANAGERS = ["npm", "yarn", "pnpm", "bun", "deno"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/**
 * Lock file mappings
 */
export interface LockFileMapping {
	readonly npm: "package-lock.json";
	readonly yarn: "yarn.lock";
	readonly pnpm: "pnpm-lock.yaml";
	readonly bun: "bun.lockb";
	readonly deno: "deno.lock";
}

/**
 * Package manager detection result
 */
export interface PackageManagerDetection {
	readonly manager: PackageManager;
	readonly lockFile: string;
	readonly confidence: "high" | "medium" | "low";
}

/**
 * Dependency types
 */
export const DEPENDENCY_TYPES = [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
] as const;

export type DependencyType = (typeof DEPENDENCY_TYPES)[number];

/**
 * Update mode for dependencies
 */
export const UPDATE_MODES = ["major", "minor", "patch", "latest"] as const;

export type UpdateMode = (typeof UPDATE_MODES)[number];

/**
 * Package information
 */
export interface PackageInfo {
	readonly name: string;
	readonly version?: string;
	readonly type?: DependencyType;
}

/**
 * Command options
 */
export interface CommandOptions {
	readonly cwd: string;
	readonly silent?: boolean;
	readonly interactive?: boolean;
	readonly global?: boolean;
	readonly exact?: boolean;
	readonly frozen?: boolean;
	readonly production?: boolean;
}

/**
 * Install options
 */
export interface InstallOptions extends CommandOptions {
	readonly frozen?: boolean;
	readonly production?: boolean;
}

/**
 * Add options
 */
export interface AddOptions extends CommandOptions {
	readonly type?: DependencyType;
	readonly exact?: boolean;
	readonly global?: boolean;
}

/**
 * Update options
 */
export interface UpdateOptions extends CommandOptions {
	readonly mode?: UpdateMode;
	readonly interactive?: boolean;
}

/**
 * Remove options
 */
export interface RemoveOptions extends CommandOptions {
	readonly global?: boolean;
}

/**
 * Run options
 */
export interface RunOptions extends CommandOptions {
	readonly args?: readonly string[];
}
