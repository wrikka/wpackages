<script setup lang="ts">

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')

const items = ref([
  { id: '1', content: 'git commit -m "feat: add new feature"', timestamp: Date.now() - 1000 * 60 * 5 },
  { id: '2', content: 'npm install @types/node', timestamp: Date.now() - 1000 * 60 * 10 },
  { id: '3', content: 'docker-compose up -d', timestamp: Date.now() - 1000 * 60 * 15 },
])

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleCopy = (content: string) => {
  navigator.clipboard.writeText(content)
}

const handleDelete = (id: string) => {
  items.value = items.value.filter(item => item.id !== id)
}

</script>

<template>

  <div
    v-if="isOpen"
    class="fixed right-0 top-0 z-50 h-full w-96 border-l border-gray-700 bg-gray-900 shadow-xl"
  >
    <div class="flex items-center justify-between border-b border-gray-700 px-4 py-3">
      <div class="flex items-center gap-2">
        <div i-lucide-clipboard />
        <h2 class="text-sm font-semibold text-white">Clipboard History</h2>
      </div>
      <button
        class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        @click="emit('close')"
      >
        <div i-lucide-x />
      </button>
    </div>
    <div class="border-b border-gray-700 px-4 py-3">
      <div class="relative">
        <div class="i-lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="input"
        />
      </div>
    </div>
    <div class="flex-1 overflow-auto p-4">
      <div class="space-y-2">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="group rounded-md border border-gray-700 bg-gray-800 p-3 transition-colors hover:border-blue-500"
        >
          <code class="text-sm text-gray-300">{{ item.content }}</code>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{{ formatDateTime(item.timestamp) }}</span>
            <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                class="rounded p-1 hover:bg-gray-700"
                @click="handleCopy(item.content)"
              >
                <div i-lucide-copy />
              </button>
              <button
                class="rounded p-1 text-red-400 hover:bg-gray-700"
                @click="handleDelete(item.id)"
              >
                <div i-lucide-trash-2 />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>