<script setup lang="ts">


const usage = ref({
  tokens: 850000,
  requests: 2450,
  storage: 2.5 * 1024 * 1024 * 1024 // 2.5GB in bytes
})
const limits = ref({
  tokens: 1000000,
  requests: 5000,
  storage: 5 * 1024 * 1024 * 1024 // 5GB in bytes
})
const featureLimits = ref([
  { name: 'Agents', current: 8, limit: 10 },
  { name: 'KBs', current: 3, limit: 5 },
  { name: 'Exports', current: 45, limit: 50 },
  { name: 'Shares', current: 12, limit: 20 }
])
const dailyUsage = ref([
  { date: '2024-01-01', label: 'M', tokens: 120000 },
  { date: '2024-01-02', label: 'T', tokens: 145000 },
  { date: '2024-01-03', label: 'W', tokens: 98000 },
  { date: '2024-01-04', label: 'T', tokens: 165000 },
  { date: '2024-01-05', label: 'F', tokens: 134000 },
  { date: '2024-01-06', label: 'S', tokens: 45000 },
  { date: '2024-01-07', label: 'S', tokens: 89000 }
])
const resetDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + (30 - date.getDate()))
  return date
})
const usagePercent = computed(() => {
  return Math.round((usage.value.tokens / limits.value.tokens) * 100)
})
const maxDailyTokens = computed(() => {
  return Math.max(...dailyUsage.value.map(d => d.tokens))
})
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
const formatStorage = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return bytes + ' B'
}
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}
const getProgressColor = (current: number, limit: number) => {
  const percent = (current / limit) * 100
  if (percent > 80) return 'red'
  if (percent > 60) return 'yellow'
  return 'green'
}
const upgradePlan = () => {
  // Navigate to pricing
}

</script>

<template>

  <div class="quota-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-chart-pie" class="text-primary" />
        Usage & Quotas
      </h3>
      <UBadge :color="usagePercent > 80 ? 'red' : usagePercent > 60 ? 'yellow' : 'green'" size="sm">
        {{ usagePercent }}% used
      </UBadge>
    </div>

    <div class="panel-content space-y-4">
      <!-- Token Usage -->
      <div class="quota-section">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">Tokens This Month</span>
          <span class="text-sm text-gray-500">{{ formatNumber(usage.tokens) }} / {{ formatNumber(limits.tokens) }}</span>
        </div>
        <UProgress :value="(usage.tokens / limits.tokens) * 100" :color="getProgressColor(usage.tokens, limits.tokens)" />
        <p class="text-xs text-gray-500 mt-1">Resets {{ formatDate(resetDate) }}</p>
      </div>

      <!-- Requests -->
      <div class="quota-section">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">API Requests</span>
          <span class="text-sm text-gray-500">{{ formatNumber(usage.requests) }} / {{ formatNumber(limits.requests) }}</span>
        </div>
        <UProgress :value="(usage.requests / limits.requests) * 100" :color="getProgressColor(usage.requests, limits.requests)" />
      </div>

      <!-- Storage -->
      <div class="quota-section">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">Storage</span>
          <span class="text-sm text-gray-500">{{ formatStorage(usage.storage) }} / {{ formatStorage(limits.storage) }}</span>
        </div>
        <UProgress :value="(usage.storage / limits.storage) * 100" :color="getProgressColor(usage.storage, limits.storage)" />
      </div>

      <!-- Feature Limits -->
      <div class="feature-limits">
        <p class="text-sm font-medium mb-2">Feature Limits</p>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="feature in featureLimits"
            :key="feature.name"
            class="feature-item p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
          >
            <p class="text-xs text-gray-500">{{ feature.name }}</p>
            <p class="font-semibold" :class="feature.current >= feature.limit ? 'text-red-500' : ''">
              {{ feature.current }}/{{ feature.limit }}
            </p>
          </div>
        </div>
      </div>

      <!-- Usage History -->
      <div class="usage-history">
        <p class="text-sm font-medium mb-2">Daily Usage (Last 7 Days)</p>
        <div class="flex items-end gap-1 h-20">
          <div
            v-for="day in dailyUsage"
            :key="day.date"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full bg-primary rounded-t transition-all"
              :style="{ height: `${(day.tokens / maxDailyTokens) * 100}%` }"
            />
            <span class="text-xs text-gray-500">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Upgrade CTA -->
      <div v-if="usagePercent > 80" class="upgrade-cta p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 w-5 h-5 mt-0.5" />
          <div class="flex-1">
            <p class="font-medium text-sm text-red-700 dark:text-red-300">Approaching Limit</p>
            <p class="text-sm text-red-600 dark:text-red-400">You're using {{ usagePercent }}% of your quota.</p>
          </div>
          <UButton size="xs" color="red" @click="upgradePlan">Upgrade</UButton>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

.quota-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>