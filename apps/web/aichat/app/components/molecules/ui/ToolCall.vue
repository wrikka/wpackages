<script setup lang="ts">

import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions'

defineProps<{
  toolCall: ChatCompletionMessageToolCall
  result?: unknown
}>()
const isOpen = ref(false)

</script>

<template>

  <div class="my-2 p-4 border rounded-lg bg-gray-50">
    <button class="w-full text-left font-mono text-sm" @click="isOpen = !isOpen">
      <span class="i-carbon-terminal mr-2"></span>
      <span>{{ toolCall.function.name }}</span>
    </button>
    <div v-if="isOpen" class="mt-2 pt-2 border-t">
      <p class="font-semibold">Arguments:</p>
      <pre class="bg-gray-100 p-2 rounded text-xs">{{ JSON.stringify(JSON.parse(toolCall.function.arguments), null, 2) }}</pre>
      <div v-if="result !== undefined" class="mt-2">
        <p class="font-semibold">Result:</p>
        <pre class="bg-gray-100 p-2 rounded text-xs">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>
  </div>

</template>