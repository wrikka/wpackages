import { invoke } from '@tauri-apps/api/core'

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  license: string
  homepage?: string
  repository?: string
  category: PluginCategory
  tags: string[]
  wasm_url: string
  wasm_hash: string
  icon_url?: string
  screenshot_urls: string[]
  permissions: string[]
  dependencies: string[]
  min_terminal_version: string
  created_at: string
  updated_at: string
  downloads: number
  rating: number
  rating_count: number
}

export interface InstalledPlugin {
  manifest: PluginManifest
  installed_at: string
  enabled: boolean
  version: string
  path: string
}

export interface PluginReview {
  id: string
  plugin_id: string
  user_id: string
  username: string
  rating: number
  title: string
  content: string
  created_at: string
}

export enum PluginCategory {
  Theme = 'Theme',
  Tool = 'Tool',
  Integration = 'Integration',
  Productivity = 'Productivity',
  Developer = 'Developer',
  Utility = 'Utility',
}

export function usePluginMarketplace() {
  const plugins = ref<PluginManifest[]>([])
  const installedPlugins = ref<InstalledPlugin[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<PluginCategory | null>(null)

  const searchPlugins = async (query: string, category?: PluginCategory) => {
    loading.value = true
    error.value = null
    try {
      const categoryStr = category ? JSON.stringify(category) : undefined
      const result = await invoke<PluginManifest[]>('search_plugins', {
        query,
        category: categoryStr,
      })
      plugins.value = result
    } catch (e) {
      error.value = e as string
    } finally {
      loading.value = false
    }
  }

  const getFeaturedPlugins = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await invoke<PluginManifest[]>('get_featured_plugins')
      plugins.value = result
    } catch (e) {
      error.value = e as string
    } finally {
      loading.value = false
    }
  }

  const getPopularPlugins = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await invoke<PluginManifest[]>('get_popular_plugins')
      plugins.value = result
    } catch (e) {
      error.value = e as string
    } finally {
      loading.value = false
    }
  }

  const getRecentPlugins = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await invoke<PluginManifest[]>('get_recent_plugins')
      plugins.value = result
    } catch (e) {
      error.value = e as string
    } finally {
      loading.value = false
    }
  }

  const installPlugin = async (pluginId: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await invoke<InstalledPlugin>('install_plugin', { pluginId })
      await loadInstalledPlugins()
      return result
    } catch (e) {
      error.value = e as string
      throw e
    } finally {
      loading.value = false
    }
  }

  const uninstallPlugin = async (pluginId: string) => {
    loading.value = true
    error.value = null
    try {
      await invoke('uninstall_plugin', { pluginId })
      await loadInstalledPlugins()
    } catch (e) {
      error.value = e as string
      throw e
    } finally {
      loading.value = false
    }
  }

  const enablePlugin = async (pluginId: string) => {
    try {
      await invoke('enable_plugin', { pluginId })
      await loadInstalledPlugins()
    } catch (e) {
      error.value = e as string
      throw e
    }
  }

  const disablePlugin = async (pluginId: string) => {
    try {
      await invoke('disable_plugin', { pluginId })
      await loadInstalledPlugins()
    } catch (e) {
      error.value = e as string
      throw e
    }
  }

  const loadInstalledPlugins = async () => {
    try {
      const result = await invoke<InstalledPlugin[]>('get_installed_plugins')
      installedPlugins.value = result
    } catch (e) {
      error.value = e as string
    }
  }

  const getPluginReviews = async (pluginId: string) => {
    try {
      const result = await invoke<PluginReview[]>('get_plugin_reviews', { pluginId })
      return result
    } catch (e) {
      error.value = e as string
      return []
    }
  }

  const addPluginReview = async (review: PluginReview) => {
    try {
      await invoke('add_plugin_review', { reviewJson: JSON.stringify(review) })
    } catch (e) {
      error.value = e as string
      throw e
    }
  }

  const isPluginInstalled = (pluginId: string) => {
    return installedPlugins.value.some(p => p.manifest.id === pluginId)
  }

  const getInstalledPlugin = (pluginId: string) => {
    return installedPlugins.value.find(p => p.manifest.id === pluginId)
  }

  const filteredPlugins = computed(() => {
    let result = plugins.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query)),
      )
    }

    if (selectedCategory.value) {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    return result
  })

  const featuredPlugins = computed(() => {
    return plugins.value.filter(p => p.downloads > 1000 && p.rating >= 4.0).slice(0, 10)
  })

  const popularPlugins = computed(() => {
    return [...plugins.value].sort((a, b) => b.downloads - a.downloads).slice(0, 20)
  })

  const recentPlugins = computed(() => {
    return [...plugins.value].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 20)
  })

  // Initialize
  onMounted(() => {
    loadInstalledPlugins()
    getFeaturedPlugins()
  })

  return {
    plugins,
    installedPlugins,
    loading,
    error,
    searchQuery,
    selectedCategory,
    searchPlugins,
    getFeaturedPlugins,
    getPopularPlugins,
    getRecentPlugins,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    loadInstalledPlugins,
    getPluginReviews,
    addPluginReview,
    isPluginInstalled,
    getInstalledPlugin,
    filteredPlugins,
    featuredPlugins,
    popularPlugins,
    recentPlugins,
  }
}
