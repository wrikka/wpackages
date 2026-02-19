<script setup lang="ts">

const tabStore = useTabStore()
const paneStore = usePaneStore()

const { tabs, activeTabId } = storeToRefs(tabStore)
const { panes, activePaneId } = storeToRefs(paneStore)

const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value))
const currentTime = ref('')

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(updateTime)
})

</script>

<template>

  <div class="flex items-center justify-between border-t border-gray-700 bg-gray-900 px-4 py-1.5 text-xs">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5 text-gray-300">
        <div i-lucide-terminal />
        <span>{{ activeTab?.title || 'Terminal' }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-gray-400">
        <div i-lucide-layout />
        <span>{{ panes.length }} panes</span>
      </div>
    </div>
    <div class="flex items-center gap-4 text-gray-400">
      <div class="flex items-center gap-1.5">
        <div i-lucide-cpu />
        <span>CPU: 15%</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div i-lucide-hard-drive />
        <span>Mem: 256 MB</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div i-lucide-clock />
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </div>

</template>