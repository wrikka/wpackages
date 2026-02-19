<script setup lang="ts">

import type { TokenUsage, SessionTokenStats } from '~/shared/types/tokens'

const props = defineProps<{
  usage: TokenUsage | null
  stats: SessionTokenStats | null
  budget: { used: number; limit: number }
}>()
const showDetails = ref(false)
const costColor = computed(() => {
  if (!props.budget.limit) return 'text-gray-500'
  const percentage = (props.budget.used / props.budget.limit) * 100
  if (percentage > 90) return 'text-red-500'
  if (percentage > 70) return 'text-yellow-500'
  return 'text-green-500'
})
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

</script>

<template>

  <div class="token-counter inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
    <span class="i-carbon-token text-sm"></span>
    
    <div class="flex items-center gap-2 text-sm">
      <span v-if="usage" class="font-mono">
        {{ formatNumber(usage.totalTokens) }}
      </span>
      <span v-else class="text-gray-500">--</span>
      
      <span v-if="usage" class="text-xs text-gray-500">
        (${{ usage.estimatedCost.toFixed(4) }})
      </span>
    </div>
    
    <button class="btn-icon text-xs" @click="showDetails = !showDetails">
      <span :class="showDetails ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'"></span>
    </button>
    
    <div
      v-if="showDetails"
      class="token-details absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <h4 class="font-medium mb-3">Token Usage</h4>
      
      <div v-if="usage" class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Prompt</span>
          <span class="font-mono">{{ formatNumber(usage.promptTokens) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Completion</span>
          <span class="font-mono">{{ formatNumber(usage.completionTokens) }}</span>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-medium">
          <span>Total</span>
          <span class="font-mono">{{ formatNumber(usage.totalTokens) }}</span>
        </div>
      </div>
      
      <div v-if="stats" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h5 class="text-sm font-medium mb-2">Session Stats</h5>
        <div class="space-y-1 text-xs text-gray-500">
          <div class="flex justify-between">
            <span>Messages</span>
            <span>{{ stats.messageCount }}</span>
          </div>
          <div class="flex justify-between">
            <span>Avg/Msg</span>
            <span>{{ formatNumber(stats.averageTokensPerMessage) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total Cost</span>
            <span>${{ stats.totalCost.toFixed(4) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="budget.limit > 0" class="mt-4">
        <div class="flex justify-between text-xs mb-1">
          <span>Daily Budget</span>
          <span :class="costColor">{{ ((budget.used / budget.limit) * 100).toFixed(0) }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full transition-all"
            :class="costColor.replace('text-', 'bg-')"
            :style="{ width: `${Math.min((budget.used / budget.limit) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>

</template>