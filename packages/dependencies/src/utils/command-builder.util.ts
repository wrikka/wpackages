import { COMMANDS, DEPENDENCY_FLAGS, UPDATE_MODE_FLAGS } from "../constant/index";
import type {
	AddOptions,
	InstallOptions,
	PackageInfo,
	PackageManager,
	RemoveOptions,
	RunOptions,
	UpdateOptions,
} from "../types/index";

/**
 * Build install command arguments
 * @param manager - Package manager to use
 * @param options - Install options
 * @returns Array of command arguments
 */
export function buildInstallArgs(manager: PackageManager, options: InstallOptions): readonly string[] {
	const args = [...COMMANDS[manager].install];

	if (options.frozen) {
		if (manager === "npm") args.push("--frozen-lockfile");
		if (manager === "yarn") args.push("--frozen-lockfile");
		if (manager === "pnpm") args.push("--frozen-lockfile");
		if (manager === "bun") args.push("--frozen-lockfile");
		if (manager === "deno") args.push("--frozen");
	}

	if (options.production) {
		if (manager === "npm") args.push("--omit=dev");
		if (manager === "yarn") args.push("--production");
		if (manager === "pnpm") args.push("--production");
		if (manager === "bun") args.push("--production");
	}

	if (options.silent) {
		args.push("--silent");
	}

	return args;
}

/**
 * Build add command arguments
 * @param manager - Package manager to use
 * @param packages - Packages to add
 * @param options - Add options
 * @returns Array of command arguments
 */
export function buildAddArgs(
	manager: PackageManager,
	packages: readonly PackageInfo[],
	options: AddOptions,
): readonly string[] {
	const args = [...COMMANDS[manager].add];

	// Add package names
	for (const pkg of packages) {
		const pkgName = pkg.version ? `${pkg.name}@${pkg.version}` : pkg.name;
		args.push(pkgName);
	}

	// Add dependency type flags
	if (options.type) {
		const flags = DEPENDENCY_FLAGS[manager][options.type];
		args.push(...flags);
	}

	// Add global flag
	if (options.global) {
		if (manager === "npm") args.push("--global");
		if (manager === "yarn") args.push("global");
		if (manager === "pnpm") args.push("--global");
		if (manager === "bun") args.push("--global");
		if (manager === "deno") args.push("--global");
	}

	// Add exact flag
	if (options.exact) {
		if (manager === "npm") args.push("--save-exact");
		if (manager === "yarn") args.push("--exact");
		if (manager === "pnpm") args.push("--save-exact");
		if (manager === "bun") args.push("--exact");
	}

	if (options.silent) {
		args.push("--silent");
	}

	return args;
}

/**
 * Build remove command arguments
 * @param manager - Package manager to use
 * @param packages - Packages to remove
 * @param options - Remove options
 * @returns Array of command arguments
 */
export function buildRemoveArgs(
	manager: PackageManager,
	packages: readonly string[],
	options: RemoveOptions,
): readonly string[] {
	const args = [...COMMANDS[manager].remove, ...packages];

	if (options.global) {
		if (manager === "npm") args.push("--global");
		if (manager === "yarn") args.push("global");
		if (manager === "pnpm") args.push("--global");
		if (manager === "bun") args.push("--global");
		if (manager === "deno") args.push("--global");
	}

	if (options.silent) {
		args.push("--silent");
	}

	return args;
}

/**
 * Build update command arguments
 * @param manager - Package manager to use
 * @param packages - Packages to update (undefined for all)
 * @param options - Update options
 * @returns Array of command arguments
 */
export function buildUpdateArgs(
	manager: PackageManager,
	packages: readonly string[] | undefined,
	options: UpdateOptions,
): readonly string[] {
	const args = [...COMMANDS[manager].update];

	// Add specific packages or update all
	if (packages && packages.length > 0) {
		args.push(...packages);
	}

	// Add update mode flags
	if (options.mode) {
		const flags = UPDATE_MODE_FLAGS[manager][options.mode];
		args.push(...flags);
	}

	// Add interactive flag
	if (options.interactive) {
		if (manager === "npm") args.push("--interactive");
		if (manager === "yarn") args.push("--interactive");
		if (manager === "pnpm") args.push("--interactive");
		if (manager === "bun") args.push("--interactive");
	}

	if (options.silent) {
		args.push("--silent");
	}

	return args;
}

/**
 * Build run command arguments
 * @param manager - Package manager to use
 * @param script - Script name to run
 * @param options - Run options
 * @returns Array of command arguments
 */
export function buildRunArgs(manager: PackageManager, script: string, options: RunOptions): readonly string[] {
	const args = [...COMMANDS[manager].run, script];

	if (options.args && options.args.length > 0) {
		// npm and yarn need -- before args
		if (manager === "npm" || manager === "yarn") {
			args.push("--");
		}
		args.push(...options.args);
	}

	return args;
}

/**
 * Build exec command arguments
 * @param manager - Package manager to use
 * @param command - Command to execute
 * @param args - Command arguments
 * @returns Array of command arguments
 */
export function buildExecArgs(manager: PackageManager, command: string, args: readonly string[]): readonly string[] {
	const cmdArgs = [...COMMANDS[manager].exec];

	if (manager === "deno") {
		// deno uses: deno run npm:command
		cmdArgs.push(`npm:${command}`);
	} else {
		cmdArgs.push(command);
	}

	cmdArgs.push(...args);

	return cmdArgs;
}

/**
 * Build outdated command arguments
 * @param manager - Package manager to use
 * @returns Array of command arguments
 */
export function buildOutdatedArgs(manager: PackageManager): readonly string[] {
	return [...COMMANDS[manager].outdated];
}
