import type { WatchOptions as ChokidarWatchOptions } from "chokidar";

export type CacheConfig = {
	readonly ttl?: number | undefined;
	readonly enabled?: boolean | undefined;
};

export type ProxyConfig = {
	readonly context: readonly string[];
	readonly target: string;
	readonly changeOrigin?: boolean;
	readonly pathRewrite?: Record<string, string>;
	readonly secure?: boolean;
};

import type { WdevOptions } from "./wdev";

export type DevServerConfig = {
	readonly plugins?: WdevOptions<object>;
	readonly port: number;
	readonly hostname: string;
	readonly root?: string;
	readonly alias?: Record<string, string>;
	readonly extensions?: readonly string[];
	readonly cache?: Partial<CacheConfig>;
	readonly watch?: Partial<ChokidarWatchOptions>;
	readonly server?: {
		readonly middleware?: Array<(req: Request, res: Response, next: () => Promise<void>) => Promise<void>>;
		readonly proxy?: readonly ProxyConfig[];
		readonly https?: {
			readonly key: string;
			readonly cert: string;
		};
	};
};

export type ServerStats = {
	readonly performance: {
		readonly startTime: number;
		readonly totalReloads: number;
		readonly totalFileEvents: number;
		readonly averageReloadTime: number;
		readonly maxReloadTime: number;
		readonly minReloadTime: number;
		readonly watchedFiles: number;
	};
	readonly watcher: { readonly active: boolean } | null;
	readonly cache: { readonly active: boolean } | null;
	readonly hmr: { readonly active: boolean; readonly connectedClients: number } | null;
	readonly server: { readonly status: "running" | "stopped" } | null;
};

export type DevServerInstance = {
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	readonly onReload: (callback: () => void | Promise<void>) => void;
	readonly getStats: () => ServerStats;
	readonly getPerformanceStats: () => {
		readonly startTime: number;
		readonly totalReloads: number;
		readonly totalFileEvents: number;
		readonly averageReloadTime: number;
		readonly maxReloadTime: number;
		readonly minReloadTime: number;
		readonly watchedFiles: number;
	};
	readonly getRecommendations: () => string[];
};
