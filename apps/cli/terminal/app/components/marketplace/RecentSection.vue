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

  <div class="recent-section">
    <h3>Recently Updated</h3>
    <div class="plugin-grid">
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

.recent-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

</style>