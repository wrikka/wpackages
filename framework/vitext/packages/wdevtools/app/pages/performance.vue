<script setup lang="ts">
import { ref, onMounted } from 'vue';

const performanceLoadTime = ref<string | null>(null);

onMounted(() => {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
	if (navigation) {
		performanceLoadTime.value = `${navigation.duration.toFixed(2)} ms`;
	}
});
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold mb-4">Performance</h2>
    <div class="bg-gray-800 p-4 rounded">
      <div class="flex justify-between items-center">
        <span class="text-gray-400">Page Load Time</span>
        <span v-if="performanceLoadTime" class="font-mono text-lg text-green-400">{{ performanceLoadTime }}</span>
        <span v-else class="text-gray-500">N/A</span>
      </div>
    </div>
  </div>
</template>
