<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

import type { ChatMode } from '#shared/types/common'
import ChatInput from '#modules/chatinput'

async function handleSend(payload: { 
  message: string
  files: File[]
  mode: ChatMode
  model: string
  systemPrompt?: string | null 
}) {
  // Simple mode resolution
  const trimmed = payload.message.trim()
  let targetMode: Exclude<ChatMode, 'auto'> = 'chat'
  
  if (payload.mode !== 'auto') {
    targetMode = payload.mode
  } else if (trimmed.startsWith('/research')) {
    targetMode = 'research'
  } else if (trimmed.startsWith('/code')) {
    targetMode = 'code'
  } else if (trimmed.startsWith('/agent')) {
    targetMode = 'agent'
  }
  
  // Navigate to appropriate route
  const routeMap: Record<Exclude<ChatMode, 'auto'>, string> = {
    chat: '/chat',
    research: '/research',
    code: '/code',
    agent: '/agent',
    quiz: '/quiz',
    summarize: '/summarize',
    tutor: '/tutor',
    writer: '/writer',
    copywriting: '/copywriting',
    analyze: '/analyze',
    review: '/review',
    organize: '/organize',
    present: '/present'
  }
  
  const cleanMessage = trimmed.replace(/^\/\w+\s*/, '')
  
  await navigateTo({
    path: routeMap[targetMode],
    query: {
      ...(cleanMessage && { q: cleanMessage }),
      ...(payload.model && { model: payload.model }),
      ...(payload.systemPrompt && { systemPrompt: payload.systemPrompt })
    }
  })
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Chat Assistant</h1>
        <p class="text-gray-600">Start typing to begin your conversation</p>
      </div>
      
      <ChatInput :mode="'auto'" @send="handleSend" />
      
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500">
          Use <code class="px-2 py-1 bg-gray-100 rounded">/research</code>, 
          <code class="px-2 py-1 bg-gray-100 rounded">/code</code>, or 
          <code class="px-2 py-1 bg-gray-100 rounded">/agent</code> to switch modes
        </p>
      </div>
    </div>
  </div>
</template>