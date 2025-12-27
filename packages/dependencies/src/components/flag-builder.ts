import type { PackageManager } from "../types/index";

/**
 * Flag mapping for each package manager
 */
const FROZEN_FLAGS: Record<PackageManager, string> = {
	npm: "--frozen-lockfile",
	yarn: "--frozen-lockfile",
	pnpm: "--frozen-lockfile",
	bun: "--frozen-lockfile",
	deno: "--frozen",
} as const;

const PRODUCTION_FLAGS: Record<PackageManager, string> = {
	npm: "--omit=dev",
	yarn: "--production",
	pnpm: "--production",
	bun: "--production",
	deno: "",
} as const;

const GLOBAL_FLAGS: Record<PackageManager, string> = {
	npm: "--global",
	yarn: "global",
	pnpm: "--global",
	bun: "--global",
	deno: "--global",
} as const;

const EXACT_FLAGS: Record<PackageManager, string> = {
	npm: "--save-exact",
	yarn: "--exact",
	pnpm: "--save-exact",
	bun: "--exact",
	deno: "",
} as const;

const INTERACTIVE_FLAGS: Record<PackageManager, string> = {
	npm: "--interactive",
	yarn: "--interactive",
	pnpm: "--interactive",
	bun: "--interactive",
	deno: "",
} as const;

/**
 * Get frozen flag for package manager
 * @param manager - Package manager
 * @returns Flag string or empty string if not supported
 */
export function getFrozenFlag(manager: PackageManager): string {
	return FROZEN_FLAGS[manager];
}

/**
 * Get production flag for package manager
 * @param manager - Package manager
 * @returns Flag string or empty string if not supported
 */
export function getProductionFlag(manager: PackageManager): string {
	return PRODUCTION_FLAGS[manager];
}

/**
 * Get global flag for package manager
 * @param manager - Package manager
 * @returns Flag string or empty string if not supported
 */
export function getGlobalFlag(manager: PackageManager): string {
	return GLOBAL_FLAGS[manager];
}

/**
 * Get exact flag for package manager
 * @param manager - Package manager
 * @returns Flag string or empty string if not supported
 */
export function getExactFlag(manager: PackageManager): string {
	return EXACT_FLAGS[manager];
}

/**
 * Get interactive flag for package manager
 * @param manager - Package manager
 * @returns Flag string or empty string if not supported
 */
export function getInteractiveFlag(manager: PackageManager): string {
	return INTERACTIVE_FLAGS[manager];
}

/**
 * Add flag to args if condition is true
 * @param args - Arguments array
 * @param condition - Whether to add the flag
 * @param flag - Flag to add
 * @returns Modified arguments array
 */
export function addFlagIfCondition(args: string[], condition: boolean, flag: string): string[] {
	if (condition && flag) {
		args.push(flag);
	}
	return args;
}

/**
 * Add multiple flags to args
 * @param args - Arguments array
 * @param flags - Flags to add
 * @returns Modified arguments array
 */
export function addFlags(args: string[], flags: readonly string[]): string[] {
	return [...args, ...flags.filter((f) => f.length > 0)];
}
