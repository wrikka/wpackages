<script setup lang="ts">

import type { ChatSession } from '#shared/types/session';
import type { Message } from '#shared/types/message';

const route = useRoute()
const shareId = route.params.shareId as string

interface SharedSession extends Omit<ChatSession, 'userId'> {
  messages: Message[]
}

const { data: session, error } = await useFetch<SharedSession>(`/api/shared/${shareId}`)

useHead({
  title: session.value?.title || 'Shared Chat',
})

function formatDate(dateString?: string | Date) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

</script>

<template>

  <div class="flex flex-col h-screen">
    <div class="border-b border-gray-200 p-4 bg-white">
      <h1 class="text-xl font-bold">{{ session?.title || 'Shared Chat' }}</h1>
      <p class="text-sm text-gray-500">Shared on {{ formatDate(session?.updatedAt) }}</p>
    </div>
    <ChatMessageList v-if="session?.messages" :messages="session.messages" />
    <div v-else class="flex-1 flex items-center justify-center">
      <p>{{ error ? 'Session not found.' : 'Loading...' }}</p>
    </div>
  </div>

</template>