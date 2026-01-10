export interface MarketplacePlugin {
	readonly id: string;
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly author: string;
	 readonly homepage?: string;
	readonly repository?: string;
	readonly license?: string;
	 readonly keywords?: readonly string[];
	readonly downloads: number;
	readonly rating: number;
	readonly publishedAt: Date;
	readonly updatedAt: Date;
	readonly dependencies?: readonly MarketplaceDependency[];
}

export interface MarketplaceDependency {
	readonly id: string;
	readonly version: string;
	readonly optional?: boolean;
}

export interface MarketplaceSearchOptions {
	readonly query?: string;
	readonly category?: string;
	readonly author?: string;
	readonly keyword?: string;
	readonly sortBy?: "relevance" | "downloads" | "rating" | "updated";
	readonly limit?: number;
	readonly offset?: number;
}

export interface MarketplaceSearchResult {
	readonly plugins: readonly MarketplacePlugin[];
	readonly total: number;
	readonly limit: number;
	readonly offset: number;
}

export interface MarketplaceInstallOptions {
	readonly version?: string;
	readonly force?: boolean;
	readonly skipDependencies?: boolean;
}

export interface MarketplaceManager {
	readonly search: (options: MarketplaceSearchOptions) => Promise<MarketplaceSearchResult>;
	readonly getPlugin: (pluginId: string) => Promise<MarketplacePlugin | undefined>;
	readonly getVersions: (pluginId: string) => Promise<readonly string[]>;
	readonly install: (
		pluginId: string,
		options?: MarketplaceInstallOptions,
	) => Promise<{ readonly success: boolean; readonly error?: string }>;
	readonly checkUpdates: (
		installedPlugins: readonly { readonly id: string; readonly version: string }[],
	) => Promise<readonly { readonly id: string; readonly currentVersion: string; readonly latestVersion: string }[]>;
}
