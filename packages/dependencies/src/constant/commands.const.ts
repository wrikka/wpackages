import type { DependencyType, PackageManager, UpdateMode } from "../types/index";

/**
 * Command templates for each package manager
 */
export interface CommandTemplates {
	readonly install: readonly string[];
	readonly add: readonly string[];
	readonly remove: readonly string[];
	readonly update: readonly string[];
	readonly run: readonly string[];
	readonly exec: readonly string[];
	readonly outdated: readonly string[];
}

/**
 * Commands for npm
 */
export const NPM_COMMANDS: CommandTemplates = {
	install: ["install"],
	add: ["install"],
	remove: ["uninstall"],
	update: ["update"],
	run: ["run"],
	exec: ["exec"],
	outdated: ["outdated"],
} as const;

/**
 * Commands for yarn
 */
export const YARN_COMMANDS: CommandTemplates = {
	install: ["install"],
	add: ["add"],
	remove: ["remove"],
	update: ["upgrade"],
	run: ["run"],
	exec: ["dlx"],
	outdated: ["outdated"],
} as const;

/**
 * Commands for pnpm
 */
export const PNPM_COMMANDS: CommandTemplates = {
	install: ["install"],
	add: ["add"],
	remove: ["remove"],
	update: ["update"],
	run: ["run"],
	exec: ["dlx"],
	outdated: ["outdated"],
} as const;

/**
 * Commands for bun
 */
export const BUN_COMMANDS: CommandTemplates = {
	install: ["install"],
	add: ["add"],
	remove: ["remove"],
	update: ["update"],
	run: ["run"],
	exec: ["x"],
	outdated: ["outdated"],
} as const;

/**
 * Commands for deno
 */
export const DENO_COMMANDS: CommandTemplates = {
	install: ["install"],
	add: ["add"],
	remove: ["remove"],
	update: ["upgrade"],
	run: ["task"],
	exec: ["run", "npm:"],
	outdated: ["outdated"],
} as const;

/**
 * All command mappings
 */
export const COMMANDS: Record<PackageManager, CommandTemplates> = {
	npm: NPM_COMMANDS,
	yarn: YARN_COMMANDS,
	pnpm: PNPM_COMMANDS,
	bun: BUN_COMMANDS,
	deno: DENO_COMMANDS,
} as const;

/**
 * Dependency type flags for each package manager
 */
export const DEPENDENCY_FLAGS: Record<PackageManager, Record<DependencyType, readonly string[]>> = {
	npm: {
		dependencies: [],
		devDependencies: ["--save-dev"],
		peerDependencies: ["--save-peer"],
		optionalDependencies: ["--save-optional"],
	},
	yarn: {
		dependencies: [],
		devDependencies: ["--dev"],
		peerDependencies: ["--peer"],
		optionalDependencies: ["--optional"],
	},
	pnpm: {
		dependencies: [],
		devDependencies: ["--save-dev"],
		peerDependencies: ["--save-peer"],
		optionalDependencies: ["--save-optional"],
	},
	bun: {
		dependencies: [],
		devDependencies: ["--dev"],
		peerDependencies: ["--peer"],
		optionalDependencies: ["--optional"],
	},
	deno: {
		dependencies: [],
		devDependencies: ["--dev"],
		peerDependencies: [],
		optionalDependencies: [],
	},
} as const;

/**
 * Update mode flags
 */
export const UPDATE_MODE_FLAGS: Record<PackageManager, Record<UpdateMode, readonly string[]>> = {
	npm: {
		major: [],
		minor: [],
		patch: [],
		latest: ["--latest"],
	},
	yarn: {
		major: [],
		minor: [],
		patch: [],
		latest: ["--latest"],
	},
	pnpm: {
		major: [],
		minor: [],
		patch: [],
		latest: ["--latest"],
	},
	bun: {
		major: [],
		minor: [],
		patch: [],
		latest: ["--latest"],
	},
	deno: {
		major: [],
		minor: [],
		patch: [],
		latest: [],
	},
} as const;
