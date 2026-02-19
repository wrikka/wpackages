<script setup lang="ts">

import type { AgentPerformance, AgentMetricsDashboard, AgentInsight } from '~/shared/types/agentPerformance'

const props = defineProps<{
  metrics: AgentPerformance[]
  insights: AgentInsight[]
  timeRange: string
}>()
const emit = defineEmits<{
  changeTimeRange: [range: string]
  selectAgent: [agentId: string]
  compareAgents: [agentIds: string[]]
}>()
const selectedAgents = ref<string[]>([])
const compareMode = ref(false)
const activeTab = ref<'overview' | 'usage' | 'satisfaction'>('overview')
const timeRanges = ['7d', '30d', '90d', '1y', 'all']
function toggleAgentSelection(agentId: string) {
  const index = selectedAgents.value.indexOf(agentId)
  if (index > -1) {
    selectedAgents.value.splice(index, 1)
  } else if (selectedAgents.value.length < 3) {
    selectedAgents.value.push(agentId)
  }
}
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

</script>

<template>

  <div class="agent-dashboard p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Agent Performance</h3>
      <div class="flex items-center gap-2">
        <div class="flex gap-1">
          <button
            v-for="range in timeRanges"
            :key="range"
            class="btn-secondary text-xs"
            :class="timeRange === range ? 'bg-primary-100' : ''"
            @click="emit('changeTimeRange', range)"
          >
            {{ range }}
          </button>
        </div>
        <button
          class="btn-secondary text-xs"
          :class="compareMode ? 'bg-primary-100' : ''"
          @click="compareMode = !compareMode; selectedAgents = []"
        >
          Compare
        </button>
      </div>
    </div>
    
    <div class="tabs flex gap-4 mb-4 border-b">
      <button
        v-for="tab in ['overview', 'usage', 'satisfaction']"
        :key="tab"
        class="pb-2 text-sm capitalize"
        :class="activeTab === tab ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'"
        @click="activeTab = tab as any"
      >
        {{ tab }}
      </button>
    </div>
    
    <div v-if="insights.length > 0" class="insights mb-4 space-y-2">
      <div
        v-for="insight in insights.slice(0, 3)"
        :key="insight.title"
        class="flex items-center gap-2 p-2 rounded-lg"
        :class="{
          'bg-blue-50 dark:bg-blue-900/20': insight.severity === 'info',
          'bg-yellow-50 dark:bg-yellow-900/20': insight.severity === 'warning',
          'bg-red-50 dark:bg-red-900/20': insight.severity === 'critical',
        }"
      >
        <span
          class="i-carbon-warning text-lg"
          :class="{
            'text-blue-500': insight.severity === 'info',
            'text-yellow-500': insight.severity === 'warning',
            'text-red-500': insight.severity === 'critical',
          }"
        ></span>
        <div class="flex-1">
          <p class="text-sm font-medium">{{ insight.title }}</p>
          <p class="text-xs text-gray-500">{{ insight.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="agents-grid grid gap-3">
      <div
        v-for="agent in metrics"
        :key="agent.agentId"
        class="agent-card p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all"
        :class="{
          'ring-2 ring-primary-500': selectedAgents.includes(agent.agentId),
          'opacity-50': compareMode && selectedAgents.length > 0 && !selectedAgents.includes(agent.agentId),
        }"
        @click="compareMode ? toggleAgentSelection(agent.agentId) : emit('selectAgent', agent.agentId)"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="i-carbon-bot text-xl"></span>
            <span class="font-medium">{{ agent.agentId }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="i-carbon-star-filled text-yellow-500 text-sm"></span>
            <span class="text-sm">{{ agent.userSatisfaction.toFixed(1) }}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-2 text-center text-xs mb-2">
          <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <p class="text-gray-500">Convos</p>
            <p class="font-medium">{{ formatNumber(agent.totalConversations) }}</p>
          </div>
          <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <p class="text-gray-500">Messages</p>
            <p class="font-medium">{{ formatNumber(agent.totalMessages) }}</p>
          </div>
          <div class="p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <p class="text-gray-500">Tokens</p>
            <p class="font-medium">{{ formatNumber(agent.tokenUsage) }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>Avg response: {{ agent.averageResponseTime.toFixed(1) }}s</span>
          <span :class="agent.errorRate > 5 ? 'text-red-500' : 'text-green-500'">
            {{ agent.errorRate.toFixed(1) }}% errors
          </span>
        </div>
      </div>
    </div>
  </div>

</template>