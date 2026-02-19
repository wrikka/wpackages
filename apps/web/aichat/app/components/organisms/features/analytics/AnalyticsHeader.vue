<script setup lang="ts">


const timeRange = defineModel<'7d' | '30d' | '90d'>('timeRange', { default: '30d' })
const activeTab = defineModel<'overview' | 'models' | 'agents'>('activeTab', { default: 'overview' })

</script>

<template>

  <div class="flex items-center justify-between mb-4">
    <h3 class="font-semibold">Analytics</h3>
    <TimeRangeSelector v-model="timeRange" />
  </div>
  <TabNav v-model="activeTab" :tabs="['overview', 'models', 'agents']" />

</template>