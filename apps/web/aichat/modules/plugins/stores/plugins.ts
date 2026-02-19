import { defineStore } from 'pinia';

export interface PluginManifest {
  id?: string;
  name?: string;
  version?: string;
  description?: string;
  entry: string;
  permissions?: string[];
  extensionPoints?: string[];
  configSchema?: Record<string, unknown>;
}

export interface InstalledPlugin {
  id: string;
  name: string;
  version: string;
  description: string | null;
  entryUrl: string;
  manifest: PluginManifest;
  enabled: boolean;
  config: Record<string, unknown>;
  installedAt: string | Date;
  updatedAt: string | Date;
}

export const usePluginsStore = defineStore('plugins', () => {
  const plugins = ref<InstalledPlugin[]>([]);
  const isLoading = ref(false);

  const fetchPlugins = async () => {
    isLoading.value = true;
    try {
      const data = await $fetch<InstalledPlugin[]>('/api/plugins');
      plugins.value = data;
    } finally {
      isLoading.value = false;
    }
  };

  const installPlugin = async (
    manifest: PluginManifest,
    options?: { enabled?: boolean; config?: Record<string, unknown> },
  ) => {
    const res = await $fetch<{ id: string }>('/api/plugins/install', {
      method: 'POST',
      body: { manifest, enabled: options?.enabled, config: options?.config },
    });

    await fetchPlugins();
    return res.id;
  };

  const updatePlugin = async (
    id: string,
    updates: { enabled?: boolean; config?: Record<string, unknown> },
  ) => {
    await $fetch(`/api/plugins/${id}`, {
      method: 'PUT',
      body: updates,
    });

    const idx = plugins.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      plugins.value[idx] = {
        ...plugins.value[idx],
        ...('enabled' in updates ? { enabled: !!updates.enabled } : {}),
        ...('config' in updates ? { config: updates.config ?? {} } : {}),
      };
    }
  };

  const uninstallPlugin = async (id: string) => {
    await $fetch(`/api/plugins/${id}`, { method: 'DELETE' });
    plugins.value = plugins.value.filter(p => p.id !== id);
  };

  return {
    plugins,
    isLoading,
    fetchPlugins,
    installPlugin,
    updatePlugin,
    uninstallPlugin,
  };
});
