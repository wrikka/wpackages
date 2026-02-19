<script setup lang="ts">


interface Update {
  source: string;
  content: string;
  url?: string;
  timestamp: string | Date;
}
interface RealTimeSummaryData {
  type: 'real_time_summary';
  topic: string;
  updates: Update[];
}
defineProps<{ 
  summary: RealTimeSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Real-time Updates: {{ summary.topic }}</h3>
    <div class="space-y-3">
      <div v-for="(update, index) in summary.updates" :key="index" class="p-3 bg-gray-50 rounded-md">
        <div class="flex justify-between items-center">
          <p class="text-sm font-medium text-gray-700">{{ update.source }}</p>
          <p class="text-xs text-gray-500">{{ new Date(update.timestamp).toLocaleTimeString() }}</p>
        </div>
        <p class="mt-2 text-xs text-gray-600">{{ update.content }}</p>
        <a v-if="update.url" :href="update.url" target="_blank" rel="noopener noreferrer" 
           class="inline-block mt-2 text-xs font-medium text-blue-600 hover:underline">
          View Source
        </a>
      </div>
    </div>
  </div>

</template>