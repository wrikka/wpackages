<script setup lang="ts">

import { useAnalyticsStore } from '~/stores/analyticsStore';
import MetricCard from '~/components/dashboard/MetricCard.vue';
import RecentActivityList from '~/components/dashboard/RecentActivityList.vue';
import WorkflowUsageChart from '~/components/dashboard/WorkflowUsageChart.vue';

const store = useAnalyticsStore();

onMounted(() => {
  store.fetchAnalytics();
});

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Dashboard</h1>
      <p class="text-lg text-gray-400">An overview of your agent's performance and activity.</p>
    </header>

    <div v-if="store.isLoading">Loading analytics...</div>
    <div v-else-if="store.analyticsData" class="space-y-8">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard :metric="store.analyticsData.keyMetrics.timeSaved" />
        <MetricCard :metric="store.analyticsData.keyMetrics.tasksCompleted" />
        <MetricCard :metric="store.analyticsData.keyMetrics.errorsPrevented" />
        <MetricCard :metric="store.analyticsData.keyMetrics.successRate" />
      </div>

      <!-- Charts and Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Most Used Workflows</h2>
          <WorkflowUsageChart :data="store.analyticsData.workflowUsage" />
        </div>
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivityList :activities="store.analyticsData.recentActivities" />
        </div>
      </div>
    </div>
  </div>

</template>