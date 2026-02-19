<script setup lang="ts">
import { usePluginSystem } from '../composables/usePluginSystem'

interface Props {
  plugins: any[]
  onToast: (message: any) => void
}

const props = defineProps<Props>()
const { getAllowedPluginMethods } = usePluginSystem()
</script>

<template>
  <div v-if="plugins.length > 0" class="plugin-toolbar flex gap-2 p-2 border-b">
    <PluginFrameHost
      v-for="plugin in plugins"
      :key="plugin.id"
      :plugin="plugin"
      :methods="getAllowedPluginMethods(plugin)"
      @toast="onToast"
    />
  </div>
</template>
