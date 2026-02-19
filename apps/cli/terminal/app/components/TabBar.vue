<script setup lang="ts">

const tabStore = useTabStore()
const paneStore = usePaneStore()

const { tabs, activeTabId } = storeToRefs(tabStore)

const handleCreateTab = () => {
  const rootPaneId = paneStore.rootPaneId.value
  if (rootPaneId) {
    tabStore.createTab(rootPaneId)
  }
}

const handleSwitchTab = (id: string) => {
  tabStore.switchTab(id)
}

const handleCloseTab = (id: string, event: Event) => {
  event.stopPropagation()
  tabStore.closeTab(id)
}

</script>

<template>

  <div class="flex items-center border-b border-gray-700 bg-gray-900 px-2">
    <button
      class="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      @click="handleCreateTab"
    >
      <div i-lucide-plus />
      New Tab
    </button>
    <div class="mx-2 h-4 w-px bg-gray-700" />
    <div class="flex flex-1 gap-1 overflow-x-auto">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
        :class="tab.id === activeTabId ? 'bg-terminal-bg text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        @click="handleSwitchTab(tab.id)"
      >
        <span>{{ tab.title }}</span>
        <button
          class="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          :class="tab.id === activeTabId ? 'hover:bg-gray-800' : 'hover:bg-gray-700'"
          @click="handleCloseTab(tab.id, $event)"
        >
          <div i-lucide-x />
        </button>
      </div>
    </div>
  </div>

</template>