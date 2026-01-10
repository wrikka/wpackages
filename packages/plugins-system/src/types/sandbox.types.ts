export type SandboxType = "vm2" | "worker" | "isolated-module" | "none";

export type ResourceLimitType = "cpu" | "memory" | "network" | "file";

export interface ResourceLimit {
	readonly type: ResourceLimitType;
	readonly max?: number;
	readonly timeout?: number;
}

export interface SandboxOptions {
	readonly type: SandboxType;
	readonly resourceLimits?: readonly ResourceLimit[];
	readonly allowedModules?: readonly string[];
	readonly allowedGlobals?: readonly string[];
	readonly restrictedAPIs?: readonly string[];
	readonly enableConsole?: boolean;
	readonly enableNetwork?: boolean;
	readonly enableFileSystem?: boolean;
}

export interface SandboxContext {
	readonly pluginId: string;
	readonly sandboxType: SandboxType;
	readonly createdAt: Date;
	readonly isActive: boolean;
}

export interface SandboxResult<T = unknown> {
	readonly success: boolean;
	readonly value?: T;
	readonly error?: Error;
	readonly executionTime?: number;
	readonly memoryUsage?: number;
}

export interface SandboxManager {
	readonly create: (pluginId: string, options: SandboxOptions) => Promise<SandboxContext>;
	readonly execute: <T>(
		context: SandboxContext,
		fn: () => T | Promise<T>,
	) => Promise<SandboxResult<T>>;
	readonly destroy: (context: SandboxContext) => Promise<void>;
	readonly isActive: (context: SandboxContext) => boolean;
	readonly getResourceUsage: (context: SandboxContext) => {
		readonly memory?: number;
		readonly cpu?: number;
	};
}
