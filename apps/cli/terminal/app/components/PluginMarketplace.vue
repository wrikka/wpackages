<script setup lang="ts">

import { usePluginMarketplace, PluginCategory } from '~/composables/usePluginMarketplace'
import FeaturedSection from './marketplace/FeaturedSection.vue'
import PopularSection from './marketplace/PopularSection.vue'
import RecentSection from './marketplace/RecentSection.vue'
import InstalledSection from './marketplace/InstalledSection.vue'
import SearchSection from './marketplace/SearchSection.vue'

const {
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
  isPluginInstalled,
  filteredPlugins,
  featuredPlugins,
  popularPlugins,
  recentPlugins,
} = usePluginMarketplace()

const activeTab = ref('featured')

const tabs = [
  { id: 'featured', label: 'Featured' },
  { id: 'popular', label: 'Popular' },
  { id: 'recent', label: 'Recent' },
  { id: 'installed', label: 'Installed' },
  { id: 'search', label: 'Search' },
]

const categories = Object.values(PluginCategory)

const handleSearch = () => {
  activeTab.value = 'search'
  searchPlugins(searchQuery.value, selectedCategory.value || undefined)
}

const handleCategoryChange = () => {
  if (activeTab.value === 'search') {
    searchPlugins(searchQuery.value, selectedCategory.value || undefined)
  }
}

const handleInstall = async (pluginId: string) => {
  try {
    await installPlugin(pluginId)
  } catch (e) {
    console.error('Failed to install plugin:', e)
  }
}

const handleUninstall = async (pluginId: string) => {
  try {
    await uninstallPlugin(pluginId)
  } catch (e) {
    console.error('Failed to uninstall plugin:', e)
  }
}

const handleEnable = async (pluginId: string) => {
  try {
    await enablePlugin(pluginId)
  } catch (e) {
    console.error('Failed to enable plugin:', e)
  }
}

const handleDisable = async (pluginId: string) => {
  try {
    await disablePlugin(pluginId)
  } catch (e) {
    console.error('Failed to disable plugin:', e)
  }
}

const retry = () => {
  if (activeTab.value === 'featured') {
    getFeaturedPlugins()
  } else if (activeTab.value === 'popular') {
    getPopularPlugins()
  } else if (activeTab.value === 'recent') {
    getRecentPlugins()
  } else if (activeTab.value === 'search') {
    handleSearch()
  }
}

</script>

<template>

  <div class="plugin-marketplace">
    <div class="marketplace-header">
      <h2>Plugin Marketplace</h2>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search plugins..."
          @input="handleSearch"
        />
        <select v-model="selectedCategory" @change="handleCategoryChange">
          <option :value="null">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <div class="marketplace-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading plugins...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retry">Retry</button>
    </div>

    <div v-else class="marketplace-content">
      <FeaturedSection
        v-if="activeTab === 'featured'"
        :plugins="featuredPlugins"
        :is-installed="isPluginInstalled"
        @install="handleInstall"
        @uninstall="handleUninstall"
        @enable="handleEnable"
        @disable="handleDisable"
      />

      <PopularSection
        v-if="activeTab === 'popular'"
        :plugins="popularPlugins"
        :is-installed="isPluginInstalled"
        @install="handleInstall"
        @uninstall="handleUninstall"
        @enable="handleEnable"
        @disable="handleDisable"
      />

      <RecentSection
        v-if="activeTab === 'recent'"
        :plugins="recentPlugins"
        :is-installed="isPluginInstalled"
        @install="handleInstall"
        @uninstall="handleUninstall"
        @enable="handleEnable"
        @disable="handleDisable"
      />

      <InstalledSection
        v-if="activeTab === 'installed'"
        :installed-plugins="installedPlugins"
        @browse-plugins="activeTab = 'featured'"
        @install="handleInstall"
        @uninstall="handleUninstall"
        @enable="handleEnable"
        @disable="handleDisable"
      />

      <SearchSection
        v-if="activeTab === 'search'"
        :plugins="filteredPlugins"
        :is-installed="isPluginInstalled"
        @install="handleInstall"
        @uninstall="handleUninstall"
        @enable="handleEnable"
        @disable="handleDisable"
      />
    </div>
  </div>

</template>

<style scoped>

.plugin-marketplace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--fg-primary);
}

.marketplace-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.marketplace-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--fg-primary);
  font-size: 0.875rem;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.search-bar select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--fg-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.marketplace-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.marketplace-tabs button {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--fg-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.marketplace-tabs button:hover {
  color: var(--fg-primary);
  background: var(--bg-secondary);
}

.marketplace-tabs button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.marketplace-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error button {
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.error button:hover {
  background: var(--accent-hover);
}

</style>