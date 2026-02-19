<script setup lang="ts">

import type { PinnedMessage } from '~/shared/types/pinned'

const props = defineProps<{
  pinnedMessages: PinnedMessage[]
  isOpen: boolean
}>()
const emit = defineEmits<{
  select: [messageId: string]
  unpin: [pinId: string]
  reorder: [pinIds: string[]]
  addNote: [pinId: string, note: string]
}>()
const filterByRole = ref<'all' | 'user' | 'assistant'>('all')
const searchQuery = ref('')
const editingNote = ref<string | null>(null)
const noteText = ref('')
const filteredPins = computed(() => {
  let result = props.pinnedMessages
  if (filterByRole.value !== 'all') {
    result = result.filter(p => p.role === filterByRole.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.content.toLowerCase().includes(query) ||
      p.note?.toLowerCase().includes(query)
    )
  }
  return result.sort((a, b) => a.order - b.order)
})
function saveNote(pinId: string) {
  emit('addNote', pinId, noteText.value)
  editingNote.value = null
  noteText.value = ''
}

</script>

<template>

  <div
    v-if="isOpen"
    class="pinned-panel fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col"
  >
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold flex items-center gap-2">
          <span class="i-carbon-pin-filled"></span>
          Pinned Messages
        </h3>
        <span class="badge">{{ pinnedMessages.length }}</span>
      </div>
      
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search pinned..."
        class="input w-full text-sm mb-2"
      >
      
      <div class="flex gap-1">
        <button
          v-for="role in ['all', 'user', 'assistant']"
          :key="role"
          class="badge text-xs cursor-pointer capitalize"
          :class="filterByRole === role ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'"
          @click="filterByRole = role as any"
        >
          {{ role }}
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div
        v-for="pin in filteredPins"
        :key="pin.id"
        class="pinned-item group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm cursor-pointer"
        :class="pin.role === 'user' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'"
        @click="emit('select', pin.messageId)"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm line-clamp-3">{{ pin.content }}</p>
          <button
            class="btn-icon text-xs opacity-0 group-hover:opacity-100"
            @click.stop="emit('unpin', pin.id)"
          >
            <span class="i-carbon-unpin"></span>
          </button>
        </div>
        
        <div v-if="pin.note" class="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
          <span class="text-yellow-600 dark:text-yellow-400 font-medium">Note:</span> {{ pin.note }}
        </div>
        
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-400">{{ new Date(pin.pinnedAt).toLocaleDateString() }}</span>
          <button
            class="text-xs text-gray-400 hover:text-primary-500"
            @click.stop="editingNote = pin.id; noteText = pin.note || ''"
          >
            {{ pin.note ? 'Edit note' : 'Add note' }}
          </button>
        </div>
      </div>
    </div>
    
    <UModal v-model="!!editingNote" :ui="{ width: 'max-w-sm' }">
      <UCard>
        <template #header>
          <h3 class="font-semibold">{{ editingNote && pinnedMessages.find(p => p.id === editingNote)?.note ? 'Edit Note' : 'Add Note' }}</h3>
        
</template>