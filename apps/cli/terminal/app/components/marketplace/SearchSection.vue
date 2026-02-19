<script setup lang="ts">

import PluginCard from '../PluginCard.vue'

defineProps<{
  plugins: any[]
  isInstalled: (id: string) => boolean
}>()

const emit = defineEmits<{
  install: [id: string]
  uninstall: [id: string]
  enable: [id: string]
  disable: [id: string]
}>()

</script>

<template>

  <div class="search-section">
    <h3>Search Results</h3>
    <div v-if="plugins.length === 0" class="empty-state">
      <p>No plugins found</p>
    </div>
    <div v-else class="plugin-grid">
      <PluginCard
        v-for="plugin in plugins"
        :key="plugin.id"
        :plugin="plugin"
        :installed="isInstalled(plugin.id)"
        @install="$emit('install', plugin.id)"
        @uninstall="$emit('uninstall', plugin.id)"
        @enable="$emit('enable', plugin.id)"
        @disable="$emit('disable', plugin.id)"
      />
    </div>
  </div>

</template>

<style scoped>

.search-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

</style>