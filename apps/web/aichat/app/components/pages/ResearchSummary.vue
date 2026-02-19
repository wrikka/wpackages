<script setup lang="ts">


interface Source {
  id: string;
  title: string;
  url: string;
  summary: string;
}
interface ResearchSummaryData {
  type: 'research_summary';
  topic: string;
  sources: Source[];
}
defineProps<{ 
  summary: ResearchSummaryData 
}>();
defineEmits(['analyze-source']);

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Research Summary: {{ summary.topic }}</h3>
    <p class="mb-4 text-sm text-gray-600">Here are some sources I found on this topic:</p>
    <ul class="space-y-3">
      <li v-for="source in summary.sources" :key="source.id" class="p-3 transition-all duration-200 bg-gray-50 rounded-md hover:bg-gray-100">
        <div class="flex justify-between items-start">
          <a :href="source.url" target="_blank" rel="noopener noreferrer" class="flex-1">
            <p class="font-medium text-blue-600 truncate hover:underline">{{ source.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ source.summary }}</p>
          </a>
          <button @click="$emit('analyze-source', source.id)" class="ml-4 px-2 py-1 text-xs text-white bg-indigo-500 rounded hover:bg-indigo-600 flex-shrink-0">
            Analyze
          </button>
        </div>
      </li>
    </ul>
  </div>

</template>