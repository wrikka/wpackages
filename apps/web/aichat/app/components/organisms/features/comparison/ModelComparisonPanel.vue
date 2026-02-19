<script setup lang="ts">

import type { ModelComparison, ModelResponse } from '~/shared/types/comparison'

const props = defineProps<{
  comparison: ModelComparison | null
  isLoading: boolean
}>()
const emit = defineEmits<{
  regenerate: [model: string]
  rate: [responseId: string, rating: number]
}>()
const selectedModels = ref<string[]>(['gpt-4', 'claude-3-opus', 'gemini-pro'])
const availableModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta' },
]
function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

</script>

<template>

  <div class="model-comparison">
    <div class="comparison-header p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="font-semibold mb-3">Model Comparison</h3>
      
      <div class="model-selector flex flex-wrap gap-2">
        <label
          v-for="model in availableModels"
          :key="model.id"
          class="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer transition-colors"
          :class="selectedModels.includes(model.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'"
        >
          <input
            v-model="selectedModels"
            type="checkbox"
            :value="model.id"
            class="hidden"
          >
          <span class="text-sm">{{ model.name }}</span>
          <span class="text-xs text-gray-500">{{ model.provider }}</span>
        </label>
      </div>
    </div>

    <div v-if="isLoading" class="p-8 text-center">
      <div class="animate-spin i-carbon-rotate-clockwise w-8 h-8 mx-auto mb-2"></div>
      <p class="text-gray-500">Generating responses...</p>
    </div>

    <div v-else-if="comparison" class="comparison-grid grid gap-4 p-4">
      <div
        v-for="response in comparison.responses"
        :key="response.id"
        class="response-card border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <div class="response-header flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ response.model }}</span>
            <span class="badge text-xs">{{ response.provider }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <span class="i-carbon-time"></span>
              {{ formatLatency(response.latency) }}
            </span>
            <span class="flex items-center gap-1">
              <span class="i-carbon-token"></span>
              {{ response.tokensUsed }}
            </span>
          </div>
        </div>
        
        <div class="response-content p-4 max-h-96 overflow-y-auto">
          <pre class="whitespace-pre-wrap text-sm">{{ response.content }}</pre>
        </div>
        
        <div class="response-footer flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
          <div class="rating flex gap-1">
            <button
              v-for="n in 5"
              :key="n"
              class="btn-icon"
              :class="response.rating && n <= response.rating ? 'text-yellow-500' : 'text-gray-300'"
              @click="emit('rate', response.id, n)"
            >
              <span class="i-carbon-star-filled"></span>
            </button>
          </div>
          <button class="btn-secondary text-sm" @click="emit('regenerate', response.model)">
            <span class="i-carbon-rotate"></span>
            Regenerate
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-8 text-center text-gray-500">
      <p>Enter a prompt and select models to compare</p>
    </div>
  </div>

</template>