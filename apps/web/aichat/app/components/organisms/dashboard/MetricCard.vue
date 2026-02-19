<script setup lang="ts">

import type { Metric } from '~/shared/types/analytics';

defineProps<{ metric: Metric }>();

</script>

<template>

  <div class="bg-gray-800 p-6 rounded-lg">
    <p class="text-sm text-gray-400">{{ metric.name }}</p>
    <p class="text-4xl font-bold mt-2">{{ metric.value }}<span v-if="metric.unit" class="text-2xl text-gray-400 ml-1">{{ metric.unit }}</span></p>
    <p class="text-xs text-green-400 mt-2">{{ metric.change }} vs last period</p>
  </div>

</template>