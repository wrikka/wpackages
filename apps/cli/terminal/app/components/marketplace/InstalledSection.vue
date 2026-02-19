<script setup lang="ts">

import PluginCard from '../PluginCard.vue'

defineProps<{
  installedPlugins: any[]
}>()

const emit = defineEmits<{
  'browse-plugins': []
  install: [id: string]
  uninstall: [id: string]
  enable: [id: string]
  disable: [id: string]
}>()

</script>

<template>

  <div class="installed-section">
    <h3>Installed Plugins</h3>
    <div v-if="installedPlugins.length === 0" class="empty-state">
      <p>No plugins installed yet</p>
      <button @click="$emit('browse-plugins')">Browse Plugins</button>
    </div>
    <div v-else class="plugin-grid">
      <PluginCard
        v-for="installed in installedPlugins"
        :key="installed.manifest.id"
        :plugin="installed.manifest"
        :installed="true"
        :enabled="installed.enabled"
        @install="$emit('install', installed.manifest.id)"
        @uninstall="$emit('uninstall', installed.manifest.id)"
        @enable="$emit('enable', installed.manifest.id)"
        @disable="$emit('disable', installed.manifest.id)"
      />
    </div>
  </div>

</template>

<style scoped>

.installed-section h3 {
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

.empty-state button {
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

.empty-state button:hover {
  background: var(--accent-hover);
}

</style>