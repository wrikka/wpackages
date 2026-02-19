import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Plugin {
	id: string;
	name: string;
	version: string;
	author: string;
	description: string;
	permissions: string[];
	enabled: boolean;
	installed: boolean;
}

interface PluginState {
	plugins: Record<string, Plugin>;
	installedPlugins: string[];
	loading: boolean;
	installPlugin: (pluginId: string) => Promise<void>;
	uninstallPlugin: (pluginId: string) => Promise<void>;
	enablePlugin: (pluginId: string) => Promise<void>;
	disablePlugin: (pluginId: string) => Promise<void>;
	getInstalledPlugins: () => Promise<Plugin[]>;
	getPlugin: (pluginId: string) => Plugin | undefined;
	updatePlugin: (pluginId: string, updates: Partial<Plugin>) => void;
}

export const usePluginStore = create<PluginState>()(
	persist(
		(set, get) => ({
			plugins: {},
			installedPlugins: [],
			loading: false,

			installPlugin: async (pluginId: string) => {
				set({ loading: true });
				try {
					const plugin = await fetch(
						`https://plugins.terminal.app/api/v1/plugins/${pluginId}`,
					).then((res) => res.json());

					set((state) => ({
						plugins: {
							...state.plugins,
							[pluginId]: { ...plugin, enabled: true, installed: true },
						},
						installedPlugins: [...state.installedPlugins, pluginId],
					}));
				} finally {
					set({ loading: false });
				}
			},

			uninstallPlugin: async (pluginId: string) => {
				set((state) => {
					const newPlugins = { ...state.plugins };
					if (newPlugins[pluginId]) {
						newPlugins[pluginId].installed = false;
						newPlugins[pluginId].enabled = false;
					}
					return {
						plugins: newPlugins,
						installedPlugins: state.installedPlugins.filter(
							(id) => id !== pluginId,
						),
					};
				});
			},

			enablePlugin: async (pluginId: string) => {
				set((state) => ({
					plugins: {
						...state.plugins,
						[pluginId]: { ...state.plugins[pluginId], enabled: true },
					},
				}));
			},

			disablePlugin: async (pluginId: string) => {
				set((state) => ({
					plugins: {
						...state.plugins,
						[pluginId]: { ...state.plugins[pluginId], enabled: false },
					},
				}));
			},

			getInstalledPlugins: async () => {
				const { plugins, installedPlugins } = get();
				return installedPlugins
					.map((id) => plugins[id])
					.filter((p): p is Plugin => p !== undefined);
			},

			getPlugin: (pluginId: string) => {
				return get().plugins[pluginId];
			},

			updatePlugin: (pluginId: string, updates: Partial<Plugin>) => {
				set((state) => ({
					plugins: {
						...state.plugins,
						[pluginId]: { ...state.plugins[pluginId], ...updates },
					},
				}));
			},
		}),
		{
			name: "plugin-storage",
			partialize: (state) => ({
				plugins: state.plugins,
				installedPlugins: state.installedPlugins,
			}),
		},
	),
);
