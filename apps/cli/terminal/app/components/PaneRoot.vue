<script setup lang="ts">

const paneStore = usePaneStore()
const terminalStore = useTerminalStore()

const { panes, rootPaneId } = storeToRefs(paneStore)

const rootPane = computed(() => {
  if (!rootPaneId.value) return null
  return paneStore.getPane(rootPaneId.value)
})

</script>

<template>

  <div class="flex h-full w-full">
    <PaneContainer v-if="rootPane" :pane="rootPane" />
    <div v-else class="flex h-full w-full items-center justify-center text-[#8b949e]">
      No terminal active
    </div>
  </div>

</template>