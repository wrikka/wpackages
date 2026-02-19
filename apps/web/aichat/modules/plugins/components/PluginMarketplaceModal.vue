<script setup lang="ts">


interface Plugin {
  id: string
  name: string
  description: string
  version: string
  rating: number
  downloadCount: number
  isOfficial: boolean
  isInstalled: boolean
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const plugins = ref<Plugin[]>([])
const search = ref('')
const activeTab = ref('All')
const showCreate = ref(false)
const filteredPlugins = computed(() => {
  let filtered = plugins.value
  if (search.value) {
    const q = search.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    )
  }
  if (activeTab.value === 'Installed') {
    filtered = filtered.filter(p => p.isInstalled)
  } else if (activeTab.value === 'My Plugins') {
    // filtered = filtered.filter(p => p.userId === currentUserId)
  } else if (activeTab.value === 'Official') {
    filtered = filtered.filter(p => p.isOfficial)
  }
  return filtered
})
const fetchPlugins = async () => {
  plugins.value = await $fetch<Plugin[]>('/api/plugins/marketplace')
}
const installPlugin = async (id: string) => {
  await $fetch(`/api/plugins/marketplace/${id}/install`, { method: 'POST' })
  fetchPlugins()
}
const uninstallPlugin = async (id: string) => {
  await $fetch(`/api/plugins/marketplace/${id}/install`, { method: 'DELETE' })
  fetchPlugins()
}
onMounted(fetchPlugins)

</script>

<template>

  <div class="plugin-marketplace-modal">
    <UModal v-model="isOpen" :ui="{ width: 'max-w-5xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Plugin Marketplace</h3>
              <p class="text-sm text-gray-500">Discover and install plugins</p>
            </div>
            <UButton color="primary" icon="i-heroicons-plus" @click="showCreate = true">
              Create Plugin
            </UButton>
          </div>
        
</template>