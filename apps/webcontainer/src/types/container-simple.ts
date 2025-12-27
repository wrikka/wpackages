// TODO: PackageManagerType from package-manager - not available yet
type PackageManagerType = "npm" | "yarn" | "pnpm" | "bun";

// TODO: Shell type from terminal - not available yet
type Shell = string;

export type ContainerStatus = "idle" | "running" | "stopped" | "error";

export type ResourceLimits = {
	readonly maxMemory?: number;
	readonly maxCpu?: number;
	readonly timeout?: number;
};

export type ContainerConfig = {
	readonly name?: string;
	readonly workdir: string;
	readonly shell?: Shell;
	readonly packageManager?: PackageManagerType;
	readonly autoDetectPackageManager?: boolean;
	readonly env?: Record<string, string>;
	readonly resourceLimits?: ResourceLimits;
};

export type ContainerInfo = {
	readonly id: string;
	readonly name: string;
	readonly status: ContainerStatus;
	readonly workdir: string;
	readonly shell: Shell;
	readonly packageManager: PackageManagerType;
	readonly createdAt: number;
	readonly startedAt?: number;
	readonly stoppedAt?: number;
};
