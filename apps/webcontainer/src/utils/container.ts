
export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type Shell = 'bash' | 'zsh' | 'pwsh' | 'cmd';
import { randomUUID } from "node:crypto";
import { DEFAULT_CONTAINER_PREFIX, DEFAULT_PACKAGE_MANAGER, DEFAULT_TIMEOUT } from "../constant";
import type { ContainerConfig, ResourceLimits } from "../types/container-simple";
import type { MergedContainerConfig } from "../types/state";

// ID Generation
export const generateContainerId = (): string => randomUUID();

export const generateProcessId = (): number => Math.floor(Math.random() * 1000000);

export const generatePortId = (port: number): string => `port-${port}`;

export const generateContainerName = (
	prefix: string = DEFAULT_CONTAINER_PREFIX,
): string => `${prefix}-${Date.now()}`;

export const generateDefaultName = (): string => `container-${Date.now()}`;

// Resource Limits
export const mergeResourceLimits = (
	limits?: ResourceLimits,
): Required<ResourceLimits> => ({
	maxCpu: limits?.maxCpu ?? 0,
	maxMemory: limits?.maxMemory ?? 0,
	timeout: limits?.timeout ?? DEFAULT_TIMEOUT,
});

// Shell Detection
export const detectShellFromConfig = (shell?: string | Shell): Shell => {
	if (shell) return shell as Shell;

	if (process.platform === "win32") {
		return "pwsh";
	}

	return "bash";
};

// Config Merging
export const mergeContainerConfig = (
	config: ContainerConfig,
	detectedPackageManager?: PackageManagerType,
): MergedContainerConfig => ({
	autoDetectPackageManager: config.autoDetectPackageManager ?? true,
	env: config.env || {},
	name: config.name || generateDefaultName(),
	packageManager: detectedPackageManager || config.packageManager || DEFAULT_PACKAGE_MANAGER,
	resourceLimits: mergeResourceLimits(config.resourceLimits),
	shell: detectShellFromConfig(config.shell),
	workdir: config.workdir,
});
