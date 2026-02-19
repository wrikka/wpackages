<script setup lang="ts">


interface TimelineEvent {
  year: number;
  title: string;
  description: string;
}
interface TimelineSummaryData {
  type: 'timeline_summary';
  topic: string;
  events: TimelineEvent[];
}
defineProps<{ 
  summary: TimelineSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-4 text-lg font-semibold text-gray-800">Timeline: {{ summary.topic }}</h3>
    <div class="relative border-l-2 border-gray-200">
      <div v-for="(event, index) in summary.events" :key="index" class="mb-8 ml-6">
        <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
          <svg class="w-3 h-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
        </span>
        <h4 class="flex items-center mb-1 text-base font-semibold text-gray-900">
          {{ event.title }} <span class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">{{ event.year }}</span>
        </h4>
        <p class="text-sm font-normal text-gray-500">{{ event.description }}</p>
      </div>
    </div>
  </div>

</template>