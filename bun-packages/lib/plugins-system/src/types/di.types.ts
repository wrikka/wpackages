export type DependencyLifetime = "singleton" | "transient" | "scoped";

export interface DependencyDescriptor<T = unknown> {
	readonly id: string;
	readonly factory: () => T | Promise<T>;
	readonly lifetime: DependencyLifetime;
	readonly dependencies?: readonly string[];
}

export interface ServiceContainer {
	readonly register: <T>(
		id: string,
		factory: () => T | Promise<T>,
		lifetime?: DependencyLifetime,
	) => void;
	readonly resolve: <T>(id: string) => Promise<T>;
	readonly has: (id: string) => boolean;
	readonly unregister: (id: string) => void;
	readonly createScope: () => ServiceContainer;
	readonly dispose: () => Promise<void>;
}

export interface DIContext {
	readonly container: ServiceContainer;
	readonly pluginId: string;
}

export interface DIPluginAPI {
	readonly registerService: <T>(
		id: string,
		factory: () => T | Promise<T>,
		lifetime?: DependencyLifetime,
	) => void;
	readonly getService: <T>(id: string) => Promise<T>;
	readonly hasService: (id: string) => boolean;
}
