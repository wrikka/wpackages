<script setup lang="ts">


const timeRange = ref('7d')
const timeRangeOptions = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' }
]
const personalStats = ref([
  { label: 'Total Chats', value: 42, change: 12 },
  { label: 'Messages Sent', value: 156, change: 8 },
  { label: 'Time Saved', value: '4.2h', change: 15 },
  { label: 'Avg Response', value: '2.3s', change: -5 }
])
const activityData = ref([
  { date: '2024-01-01', label: 'M', count: 5 },
  { date: '2024-01-02', label: 'T', count: 8 },
  { date: '2024-01-03', label: 'W', count: 3 },
  { date: '2024-01-04', label: 'T', count: 12 },
  { date: '2024-01-05', label: 'F', count: 7 },
  { date: '2024-01-06', label: 'S', count: 2 },
  { date: '2024-01-07', label: 'S', count: 4 }
])
const maxActivity = computed(() => Math.max(...activityData.value.map(d => d.count)))
const topAgents = ref([
  { id: '1', name: 'Code Assistant', avatar: 'https://i.pravatar.cc/150?u=10', chats: 18, percentage: 75 },
  { id: '2', name: 'Creative Writer', avatar: 'https://i.pravatar.cc/150?u=11', chats: 12, percentage: 50 },
  { id: '3', name: 'Data Analyst', avatar: 'https://i.pravatar.cc/150?u=12', chats: 8, percentage: 33 }
])
const insights = ref([
  'Most productive on Thursday afternoons',
  'Code Assistant saves you 30 min/day',
  'Response time improved by 15%'
])

</script>

<template>

  <div class="chat-analytics-personal">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-chart-bar" class="text-primary" />
        Your Activity
      </h3>
      <USelect v-model="timeRange" :options="timeRangeOptions" size="xs" />
    </div>

    <div class="panel-content space-y-4">
      <!-- Stats Grid -->
      <div class="stats-grid grid grid-cols-2 gap-3">
        <div v-for="stat in personalStats" :key="stat.label" class="stat-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p class="text-2xl font-bold text-primary">{{ stat.value }}</p>
          <p class="text-xs text-gray-500">{{ stat.label }}</p>
          <p class="text-xs" :class="stat.change > 0 ? 'text-green-500' : 'text-gray-400'">
            {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
          </p>
        </div>
      </div>

      <!-- Activity Chart -->
      <div class="activity-chart">
        <p class="text-sm font-medium mb-2">Daily Activity</p>
        <div class="flex items-end gap-1 h-24">
          <div
            v-for="day in activityData"
            :key="day.date"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full bg-primary rounded-t transition-all hover:bg-primary-600"
              :style="{ height: `${(day.count / maxActivity) * 100}%` }"
            />
            <span class="text-xs text-gray-500">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Top Agents -->
      <div class="top-agents">
        <p class="text-sm font-medium mb-2">Most Used Agents</p>
        <div class="space-y-2">
          <div v-for="agent in topAgents" :key="agent.id" class="agent-stat flex items-center gap-3">
            <UAvatar :src="agent.avatar" size="sm" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm">{{ agent.name }}</span>
                <span class="text-xs text-gray-500">{{ agent.chats }} chats</span>
              </div>
              <UProgress :value="agent.percentage" size="xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="insights p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Insights</p>
        <ul class="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <li v-for="insight in insights" :key="insight" class="flex items-start gap-2">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 mt-0.5 shrink-0" />
            <span>{{ insight }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>

<style scoped>

.chat-analytics-personal {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>