<script setup lang="ts">

import type { KeyboardShortcut, ShortcutCategory } from '~/shared/types/shortcuts'

const props = defineProps<{
  categories: ShortcutCategory[]
}>()
const emit = defineEmits<{
  update: [shortcut: KeyboardShortcut]
  reset: [shortcutId: string]
  resetAll: []
}>()
const isOpen = ref(false)
const searchQuery = ref('')
const editingShortcut = ref<string | null>(null)
const recordingKeys = ref(false)
const recordedKeys = ref<string[]>([])
const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories
  const query = searchQuery.value.toLowerCase()
  return props.categories.map(cat => ({
    ...cat,
    shortcuts: cat.shortcuts.filter(s =>
      s.action.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    )
  })).filter(cat => cat.shortcuts.length > 0)
})
function startRecording(shortcutId: string) {
  editingShortcut.value = shortcutId
  recordingKeys.value = true
  recordedKeys.value = []
}
function formatKeyBinding(key: string): string {
  return key
    .replace('Key', '')
    .replace('Digit', '')
    .replace('Arrow', '')
    .replace('Control', 'Ctrl')
}

</script>

<template>

  <div>
    <button class="btn-icon" title="Keyboard shortcuts" @click="isOpen = true">
      <span class="i-carbon-keyboard"></span>
    </button>
    
    <UModal v-model="isOpen" :ui="{ width: 'max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Keyboard Shortcuts</h3>
            <button class="btn-secondary text-sm" @click="emit('resetAll')">Reset All</button>
          </div>
        
</template>