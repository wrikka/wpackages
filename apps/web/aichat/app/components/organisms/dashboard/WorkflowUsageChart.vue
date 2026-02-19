<script setup lang="ts">

import type { ChartData } from '~/shared/types/analytics';

defineProps<{ data: ChartData }>();
// This is a mock component. In a real app, you would use a library
// like Vue-Chartjs or ApexCharts to render an actual chart.

</script>

<template>

  <div class="h-64 bg-gray-900 p-4 rounded-md flex flex-col justify-end space-y-2">
    <p class="text-center text-gray-500 text-sm mb-4">Chart Placeholder</p>
    <div class="flex items-end justify-around h-full">
      <div v-for="item in data.labels" :key="item" class="w-1/4 text-center">
        <div class="bg-blue-600 mx-auto" :style="{ height: `${Math.random() * 100}%`, width: '50%' }"></div>
        <p class="text-xs mt-2 truncate">{{ item }}</p>
      </div>
    </div>
  </div>

</template>