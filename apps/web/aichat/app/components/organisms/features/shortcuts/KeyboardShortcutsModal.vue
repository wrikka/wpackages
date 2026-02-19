<script setup lang="ts">

import type { ShortcutCategory } from './types'

const isOpen = defineModel<boolean>('modelValue', { default: false })
const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { key: 'new-chat', description: 'New conversation', keys: ['Ctrl', 'K'] },
      { key: 'search', description: 'Search conversations', keys: ['Ctrl', 'Shift', 'K'] },
      { key: 'prev-chat', description: 'Previous conversation', keys: ['Ctrl', '['] },
      { key: 'next-chat', description: 'Next conversation', keys: ['Ctrl', ']'] },
    ],
  },
  {
    name: 'Input',
    shortcuts: [
      { key: 'send', description: 'Send message', keys: ['Enter'] },
      { key: 'new-line', description: 'New line', keys: ['Shift', 'Enter'] },
      { key: 'voice', description: 'Toggle voice input', keys: ['Ctrl', 'M'] },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { key: 'favorite', description: 'Toggle favorite', keys: ['Ctrl', 'Shift', 'S'] },
      { key: 'export', description: 'Export conversation', keys: ['Ctrl', 'E'] },
      { key: 'branch', description: 'Create branch', keys: ['Ctrl', 'B'] },
      { key: 'shortcut-help', description: 'Show shortcuts', keys: ['?', 'Ctrl', '/'] },
    ],
  },
]
const resetToDefaults = () => {
  // Reset logic here
}
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
      isOpen.value = true
    }
  }
  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

</script>

<template>

  <div class="keyboard-shortcuts-modal">
    <Modal v-model="isOpen" width="2xl">
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
              <p class="text-sm text-gray-500">Master these shortcuts to work faster</p>
            </div>
            <Button variant="ghost" size="sm" @click="isOpen = false">
              <Icon name="lucide:x" class="w-4 h-4" />
            </Button>
          </div>
        
</template>