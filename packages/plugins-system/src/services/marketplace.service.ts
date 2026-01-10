import type {
	MarketplaceInstallOptions,
	MarketplaceManager,
	MarketplacePlugin,
	MarketplaceSearchOptions,
	MarketplaceSearchResult,
} from "../types/marketplace.types";

export const createMarketplaceManager = (
	_registryUrl: string = "https://registry.wpackages.dev",
): MarketplaceManager => {
	const plugins: Map<string, MarketplacePlugin> = new Map();

	const search = async (options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchResult> => {
		const allPlugins = Array.from(plugins.values());

		let filtered = allPlugins;

		if (options.query) {
			const query = options.query.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description.toLowerCase().includes(query) ||
					p.keywords?.some((k) => k.toLowerCase().includes(query)),
			);
		}

		if (options.category) {
			filtered = filtered.filter((p) => p.keywords?.includes(options.category!));
		}

		if (options.author) {
			filtered = filtered.filter((p) => p.author === options.author);
		}

		switch (options.sortBy) {
			case "downloads":
				filtered.sort((a, b) => b.downloads - a.downloads);
				break;
			case "rating":
				filtered.sort((a, b) => b.rating - a.rating);
				break;
			case "updated":
				filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
				break;
			default:
				filtered.sort((a, b) => b.downloads - a.downloads);
		}

		const limit = options.limit ?? 20;
		const offset = options.offset ?? 0;

		return {
			plugins: filtered.slice(offset, offset + limit),
			total: filtered.length,
			limit,
			offset,
		};
	};

	const getPlugin = async (pluginId: string): Promise<MarketplacePlugin | undefined> => {
		return plugins.get(pluginId);
	};

	const getVersions = async (pluginId: string): Promise<readonly string[]> => {
		const plugin = plugins.get(pluginId);
		return plugin ? [plugin.version] : [];
	};

	const install = async (
		pluginId: string,
		_options?: MarketplaceInstallOptions,
	): Promise<{ readonly success: boolean; readonly error?: string }> => {
		const plugin = plugins.get(pluginId);
		if (!plugin) {
			return { success: false, error: `Plugin ${pluginId} not found` };
		}

		return { success: true };
	};

	const checkUpdates = async (
		installedPlugins: readonly { readonly id: string; readonly version: string }[],
	): Promise<
		readonly { readonly id: string; readonly currentVersion: string; readonly latestVersion: string }[]
	> => {
		return installedPlugins
			.map((installed) => {
				const plugin = plugins.get(installed.id);
				if (plugin && plugin.version !== installed.version) {
					return {
						id: installed.id,
						currentVersion: installed.version,
						latestVersion: plugin.version,
					};
				}
				return null;
			})
			.filter((u): u is NonNullable<typeof u> => u !== null);
	};

	return Object.freeze({
		search,
		getPlugin,
		getVersions,
		install,
		checkUpdates,
	});
};
