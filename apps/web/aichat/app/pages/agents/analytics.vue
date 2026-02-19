<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { data: agents } = await useFetch<import('#shared/types/chat').Agent[]>('/api/agents')
const isLoading = ref(false)
const selectedAgentId = ref<string | null>(null)

const { data: metrics, refresh } = await useFetch<any>('/api/agents/metrics')

async function refreshMetrics() {
  isLoading.value = true
  await refresh()
  isLoading.value = false
}

const selectedAgentMetrics = computed(() => {
  if (!selectedAgentId.value) return null
  return (metrics.value || []).find((m: any) => m.agentId === selectedAgentId.value)
})

const topAgents = computed(() => {
  if (!metrics.value) return []
  return [...metrics.value]
    .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5)
})

</script>

<template>

  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Agent Performance Monitoring</h1>
      <button class="btn-secondary" @click="refreshMetrics" :disabled="isLoading">
        <span v-if="isLoading">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Agents -->
      <div class="bg-white border rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">Top Agents by Usage</h2>
        <div v-if="topAgents.length === 0" class="text-gray-500">No data available</div>
        <div v-else class="space-y-3">
          <div
            v-for="(agent, idx) in topAgents"
            :key="agent.agentId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-gray-400">{{ idx + 1 }}</span>
              <span class="font-medium">{{ agent.agentName || 'Unknown' }}</span>
            </div>
            <div class="text-right">
              <div class="font-bold">{{ agent.usageCount || 0 }}</div>
              <div class="text-xs text-gray-500">uses</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Agent Selection -->
      <div class="bg-white border rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">Select Agent</h2>
        <div v-if="!agents || agents.length === 0" class="text-gray-500">No agents available</div>
        <div v-else class="space-y-2">
          <button
            v-for="agent in agents"
            :key="agent.id"
            @click="selectedAgentId = agent.id"
            class="w-full p-3 border rounded text-left hover:bg-gray-50"
            :class="{ 'bg-blue-50 border-blue-500': selectedAgentId === agent.id }"
          >
            <div class="font-medium">{{ agent.name }}</div>
            <div class="text-sm text-gray-500">{{ agent.description || 'No description' }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Agent Metrics -->
    <div v-if="selectedAgentMetrics" class="mt-6 bg-white border rounded-lg p-6">
      <h2 class="text-xl font-bold mb-4">Performance Metrics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-500 mb-1">Total Usage</div>
          <div class="text-2xl font-bold">{{ selectedAgentMetrics.usageCount || 0 }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-500 mb-1">Avg Response Time</div>
          <div class="text-2xl font-bold">{{ selectedAgentMetrics.avgResponseTime?.toFixed(2) || 0 }}s</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-500 mb-1">Success Rate</div>
          <div class="text-2xl font-bold">{{ ((selectedAgentMetrics.successRate || 0) * 100).toFixed(1) }}%</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-500 mb-1">Error Count</div>
          <div class="text-2xl font-bold text-red-600">{{ selectedAgentMetrics.errorCount || 0 }}</div>
        </div>
      </div>
    </div>

    <div v-else class="mt-6 text-center py-8 text-gray-500">
      <p>Select an agent to view performance metrics</p>
    </div>
  </div>

</template>