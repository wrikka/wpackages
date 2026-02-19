<script setup lang="ts">

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const selectedIndex = ref(0)

const commands = [
  { id: '1', label: 'New Tab', category: 'Tabs', icon: 'i-lucide-plus', action: () => {} },
  { id: '2', label: 'Close Tab', category: 'Tabs', icon: 'i-lucide-x', action: () => {} },
  { id: '3', label: 'Split Horizontal', category: 'Panes', icon: 'i-lucide-columns', action: () => {} },
  { id: '4', label: 'Split Vertical', category: 'Panes', icon: 'i-lucide-rows', action: () => {} },
  { id: '5', label: 'Settings', category: 'General', icon: 'i-lucide-settings', action: () => {} },
  { id: '6', label: 'Toggle Fullscreen', category: 'General', icon: 'i-lucide-maximize', action: () => {} },
]

const filteredCommands = computed(() => {
  return commands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSelect = (index: number) => {
  filteredCommands.value[index].action()
  emit('close')
}

</script>

<template>

  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
    @click.self="emit('close')"
  >
    <div class="w-[600px] rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
      <div class="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
        <div class="i-lucide-search text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Type a command or search..."
          class="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          autofocus
        />
        <div class="text-xs text-gray-400">ESC to close</div>
      </div>
      <div class="max-h-[400px] overflow-auto p-2">
        <div class="space-y-1">
          <div
            v-for="(cmd, index) in filteredCommands"
            :key="cmd.id"
            class="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
            :class="index === selectedIndex ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'"
            @click="handleSelect(index)"
          >
            <div :class="cmd.icon" />
            <span class="flex-1 text-sm">{{ cmd.label }}</span>
            <span class="text-xs text-gray-400">{{ cmd.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>