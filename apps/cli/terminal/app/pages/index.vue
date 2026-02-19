<script setup lang="ts">

const settingsOpen = ref(false)
const clipboardOpen = ref(false)
const commandPaletteOpen = ref(false)

useHotkeys([
  {
    key: ',',
    ctrl: true,
    action: () => settingsOpen.value = true,
    preventDefault: true,
  },
  {
    key: 'V',
    ctrl: true,
    shift: true,
    action: () => clipboardOpen.value = true,
    preventDefault: true,
  },
  {
    key: 'P',
    ctrl: true,
    shift: true,
    action: () => commandPaletteOpen.value = true,
    preventDefault: true,
  },
  {
    key: 'Escape',
    action: () => {
      settingsOpen.value = false
      clipboardOpen.value = false
      commandPaletteOpen.value = false
    },
  },
])

</script>

<template>

  <div class="flex h-screen w-screen flex-col bg-terminal-bg">
    <TabBar />
    <div class="flex-1 overflow-hidden">
      <PaneRoot />
    </div>
    <StatusBar />
    <SettingsPanel :is-open="settingsOpen" @close="settingsOpen = false" />
    <ClipboardHistory :is-open="clipboardOpen" @close="clipboardOpen = false" />
    <CommandPalette :is-open="commandPaletteOpen" @close="commandPaletteOpen = false" />
  </div>

</template>