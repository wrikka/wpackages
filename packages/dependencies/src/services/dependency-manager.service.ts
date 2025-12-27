import { Effect } from "effect";
import type { AddOptions, InstallOptions, RemoveOptions, RunOptions, UpdateOptions } from "../types/index";
import {
	buildAddArgs,
	buildExecArgs,
	buildInstallArgs,
	buildOutdatedArgs,
	buildRemoveArgs,
	buildRunArgs,
	buildUpdateArgs,
	parsePackages,
} from "../utils/index";
import { executeCommand } from "./command-executor.service";
import { detectPackageManager } from "./package-manager-detector.service";

/**
 * Install dependencies
 * @param options - Install options including cwd and flags
 * @returns Effect that installs dependencies
 */
export function install(options: InstallOptions): Effect.Effect<void, Error> {
	return Effect.flatMap(
		detectPackageManager(options.cwd),
		(detection: any) => {
			const args = buildInstallArgs(detection.manager, options);
			return Effect.map(executeCommand(detection.manager, args, options.cwd, options.silent), () => {});
		},
	);
}

/**
 * Add packages
 * @param packages - Package names to add
 * @param options - Add options including cwd and dependency type
 * @returns Effect that adds packages
 */
export function add(packages: readonly string[], options: AddOptions): Effect.Effect<void, Error> {
	return Effect.flatMap(
		detectPackageManager(options.cwd),
		(detection: any) => {
			const pkgInfos = parsePackages(packages);
			const args = buildAddArgs(detection.manager, pkgInfos, options);
			return Effect.map(executeCommand(detection.manager, args, options.cwd, options.silent), () => {});
		},
	);
}

/**
 * Add development packages
 * @param packages - Package names to add as dev dependencies
 * @param options - Add options (type will be set to devDependencies)
 * @returns Effect that adds dev packages
 */
export function addDev(packages: readonly string[], options: Omit<AddOptions, "type">): Effect.Effect<void, Error> {
	return add(packages, { ...options, type: "devDependencies" });
}

/**
 * Remove packages
 * @param packages - Package names to remove
 * @param options - Remove options including cwd
 * @returns Effect that removes packages
 */
export function remove(packages: readonly string[], options: RemoveOptions): Effect.Effect<void, Error> {
	return Effect.flatMap(
		detectPackageManager(options.cwd),
		(detection: any) => {
			const args = buildRemoveArgs(detection.manager, packages, options);
			return Effect.map(executeCommand(detection.manager, args, options.cwd, options.silent), () => {});
		},
	);
}

/**
 * Update packages
 * @param packages - Package names to update (undefined for all)
 * @param options - Update options including cwd and mode
 * @returns Effect that updates packages
 */
export function update(packages: readonly string[] | undefined, options: UpdateOptions): Effect.Effect<void, Error> {
	return Effect.flatMap(
		detectPackageManager(options.cwd),
		(detection: any) => {
			const args = buildUpdateArgs(detection.manager, packages, options);
			return Effect.map(executeCommand(detection.manager, args, options.cwd, options.silent), () => {});
		},
	);
}

/**
 * Run script
 * @param script - Script name to run
 * @param options - Run options including cwd and args
 * @returns Effect that runs the script
 */
export function run(script: string, options: RunOptions): Effect.Effect<void, Error> {
	return Effect.flatMap(
		detectPackageManager(options.cwd),
		(detection: any) => {
			const args = buildRunArgs(detection.manager, script, options);
			return Effect.map(executeCommand(detection.manager, args, options.cwd, options.silent), () => {});
		},
	);
}

/**
 * Execute command (npx/bunx equivalent)
 */
export function exec(
	command: string,
	args: readonly string[],
	cwd: string,
	silent?: boolean,
): Effect.Effect<void, Error> {
	return Effect.flatMap(detectPackageManager(cwd), (detection: any) => {
		const cmdArgs = buildExecArgs(detection.manager, command, args);
		return Effect.map(executeCommand(detection.manager, cmdArgs, cwd, silent), () => {});
	});
}

/**
 * Check outdated packages
 */
export function outdated(cwd: string): Effect.Effect<string, Error> {
	return Effect.flatMap(detectPackageManager(cwd), (detection: any) => {
		const args = buildOutdatedArgs(detection.manager);
		return Effect.map(executeCommand(detection.manager, args, cwd, true), (result: any) => result.stdout);
	});
}
