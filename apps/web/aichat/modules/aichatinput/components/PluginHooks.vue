<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { usePluginSystem } from '../composables/usePluginSystem'

interface Props {
  plugins: any[]
  onSetDraft: (draft: any) => void
  onToast: (message: any) => void
}

const props = defineProps<Props>()
const { getAllowedPluginMethods, setBeforeSendHostRef } = usePluginSystem()

// Import PluginFrameHost components
const PluginFrameHost = defineAsyncComponent(() => import('./PluginFrameHost.vue'))
const PluginHookFrameHost = defineAsyncComponent(() => import('./PluginHookFrameHost.vue'))
</script>

<template>
  <div class="hidden">
    <PluginHookFrameHost
      v-for="plugin in plugins"
      :key="plugin.id"
      :ref="(el: any) => setBeforeSendHostRef(plugin.id, el)"
      :plugin="plugin"
      :methods="getAllowedPluginMethods(plugin)"
      @set-draft="onSetDraft"
      @toast="onToast"
    />
  </div>
</template>
