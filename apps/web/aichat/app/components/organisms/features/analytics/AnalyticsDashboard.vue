<script setup lang="ts">

import type { ChatAnalytics, UserAnalytics } from '~/shared/types/analytics'

const props = defineProps<{
  chatAnalytics: ChatAnalytics | null
  userAnalytics: UserAnalytics | null
}>()
const timeRange = ref<'7d' | '30d' | '90d'>('30d')
const activeTab = ref<'overview' | 'models' | 'agents'>('overview')

</script>

<template>

  <div class="analytics-dashboard p-4">
    <AnalyticsHeader v-model:time-range="timeRange" v-model:active-tab="activeTab" />
    
    <OverviewStats v-if="chatAnalytics && activeTab === 'overview'" :analytics="chatAnalytics" />
    <ModelsList v-else-if="userAnalytics && activeTab === 'models'" :analytics="userAnalytics" />
    <AgentsList v-else-if="userAnalytics && activeTab === 'agents'" :analytics="userAnalytics" />
  </div>

</template>