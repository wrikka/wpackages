<script setup lang="ts">

import type { ChatSession } from '#shared/types/chat'
import { formatDate } from '~/utils'

const props = defineProps<{
  session: ChatSession
}>()
const emit = defineEmits<{
  delete: [sessionId: string]
}>()
const sessionsStore = useSessionsStore()
async function togglePinned() {
  await sessionsStore.setSessionPinned(props.session.id, !props.session.pinned)
}
async function editTags() {
  const current = Array.isArray(props.session.tags) ? props.session.tags.join(', ') : ''
  const next = prompt('Tags (comma separated):', current)
  if (next === null) return
  const tags = next
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  await sessionsStore.setSessionTags(props.session.id, tags)
}

</script>

<template>

  <div class="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
    <div class="flex justify-between items-center group">
      <h3 class="font-medium truncate flex-1">
        {{ session.title }}
      </h3>
      <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="btn-icon-sm"
          :title="session.pinned ? 'Unpin' : 'Pin'"
          @click.stop="togglePinned"
        >
          <span :class="session.pinned ? 'i-carbon-star-filled' : 'i-carbon-star'"></span>
        </button>
        <button
          class="btn-icon-sm"
          title="Edit tags"
          @click.stop="editTags"
        >
          <span class="i-carbon-tag"></span>
        </button>
        <a :href="`/api/sessions/${session.id}/export`" download class="btn-icon-sm" @click.stop>
          <span class="i-carbon-download"></span>
        </a>
        <button
          class="text-red-500 hover:text-red-700 ml-1"
          @click.stop="emit('delete', session.id)"
        >
          ×
        </button>
      </div>
    </div>
    <p class="text-xs text-gray-500 mt-1">
      {{ formatDate(session.updatedAt instanceof Date ? session.updatedAt.getTime() : Date.parse(session.updatedAt)) }}
    </p>
  </div>

</template>