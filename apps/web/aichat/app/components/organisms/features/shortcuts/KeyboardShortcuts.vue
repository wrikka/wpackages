<script setup lang="ts">


interface Shortcut {
  id: string
  description: string
  keys: string[]
  category: string
}
const searchQuery = ref('')
const vimModeEnabled = ref(false)
const showEditModal = ref(false)
const showCheatSheet = ref(false)
const recording = ref(false)
const newKeys = ref<string[]>([])
const editingShortcut = ref<Shortcut | null>(null)
const shortcutCategories = ref([
  {
    name: 'General',
    shortcuts: [
      { id: '1', description: 'New Chat', keys: ['Ctrl', 'N'], category: 'General' },
      { id: '2', description: 'Search Chats', keys: ['Ctrl', 'K'], category: 'General' },
      { id: '3', description: 'Command Palette', keys: ['Ctrl', 'Shift', 'P'], category: 'General' },
      { id: '4', description: 'Settings', keys: ['Ctrl', ','], category: 'General' }
    ]
  },
  {
    name: 'Chat',
    shortcuts: [
      { id: '5', description: 'Send Message', keys: ['Enter'], category: 'Chat' },
      { id: '6', description: 'New Line', keys: ['Shift', 'Enter'], category: 'Chat' },
      { id: '7', description: 'Edit Last Message', keys: ['Up'], category: 'Chat' },
      { id: '8', description: 'Copy Last Code Block', keys: ['Ctrl', 'Shift', 'C'], category: 'Chat' }
    ]
  },
  {
    name: 'Navigation',
    shortcuts: [
      { id: '9', description: 'Next Chat', keys: ['Ctrl', 'J'], category: 'Navigation' },
      { id: '10', description: 'Previous Chat', keys: ['Ctrl', 'K'], category: 'Navigation' },
      { id: '11', description: 'Focus Input', keys: ['/'], category: 'Navigation' },
      { id: '12', description: 'Go to Top', keys: ['Home'], category: 'Navigation' }
    ]
  },
  {
    name: 'Editor',
    shortcuts: [
      { id: '13', description: 'Bold', keys: ['Ctrl', 'B'], category: 'Editor' },
      { id: '14', description: 'Italic', keys: ['Ctrl', 'I'], category: 'Editor' },
      { id: '15', description: 'Code', keys: ['Ctrl', '`'], category: 'Editor' },
      { id: '16', description: 'Clear Format', keys: ['Ctrl', '\\'], category: 'Editor' }
    ]
  }
])
const filteredCategories = computed(() => {
  if (!searchQuery.value) return shortcutCategories.value
  const query = searchQuery.value.toLowerCase()
  return shortcutCategories.value.map(cat => ({
    ...cat,
    shortcuts: cat.shortcuts.filter(s => 
      s.description.toLowerCase().includes(query) ||
      s.keys.some(k => k.toLowerCase().includes(query))
    )
  })).filter(cat => cat.shortcuts.length > 0)
})
const editShortcut = (shortcut: Shortcut) => {
  editingShortcut.value = { ...shortcut }
  newKeys.value = []
  showEditModal.value = true
}
const startRecording = () => {
  recording.value = true
  newKeys.value = []
}
const recordKey = (e: KeyboardEvent) => {
  if (!recording.value) return
  e.preventDefault()
  const key = e.key
  if (key === 'Escape') {
    recording.value = false
    return
  }
  if (key === 'Enter' && newKeys.value.length > 0) {
    recording.value = false
    return
  }
  const modifiers = []
  if (e.ctrlKey) modifiers.push('Ctrl')
  if (e.shiftKey) modifiers.push('Shift')
  if (e.altKey) modifiers.push('Alt')
  if (e.metaKey) modifiers.push('Cmd')
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    newKeys.value = [...modifiers, key.length === 1 ? key.toUpperCase() : key]
    recording.value = false
  }
}
const saveShortcut = () => {
  if (!editingShortcut.value) return
  editingShortcut.value.keys = newKeys.value
  showEditModal.value = false
}
const cancelEdit = () => {
  showEditModal.value = false
  editingShortcut.value = null
  newKeys.value = []
}
const resetToDefaults = () => {
  // Reset to default shortcuts
}

</script>

<template>

  <div class="shortcuts-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-keyboard" class="text-primary" />
        Keyboard Shortcuts
      </h3>
      <UButton size="xs" color="gray" variant="soft" @click="resetToDefaults">
        Reset Defaults
      </UButton>
    </div>

    <div class="panel-content space-y-4">
      <!-- Search -->
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Search shortcuts..." size="sm" />

      <!-- Categories -->
      <div class="shortcuts-categories space-y-4">
        <div v-for="category in filteredCategories" :key="category.name" class="category-section">
          <p class="text-sm font-medium mb-2 text-gray-500 uppercase">{{ category.name }}</p>
          <div class="space-y-1">
            <div
              v-for="shortcut in category.shortcuts"
              :key="shortcut.id"
              class="shortcut-item flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
            >
              <span class="text-sm">{{ shortcut.description }}</span>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <kbd
                    v-for="key in shortcut.keys"
                    :key="key"
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono"
                  >
                    {{ key }}
                  </kbd>
                </div>
                <UButton
                  size="xs"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  class="opacity-0 group-hover:opacity-100"
                  @click="editShortcut(shortcut)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vim Mode Toggle -->
      <div class="vim-mode flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <p class="font-medium">Vim Mode</p>
          <p class="text-sm text-gray-500">Use Vim-style navigation keys</p>
        </div>
        <UToggle v-model="vimModeEnabled" />
      </div>

      <!-- Cheat Sheet -->
      <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-document-text" block @click="showCheatSheet = true">
        View Printable Cheat Sheet
      </UButton>
    </div>

    <!-- Edit Shortcut Modal -->
    <UModal v-model="showEditModal">
      <UCard v-if="editingShortcut">
        <template #header>
          <h3 class="text-lg font-semibold">Edit Shortcut</h3>
        
</template>

<style scoped>

.shortcuts-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}
kbd {
  @apply font-mono;
}

</style>