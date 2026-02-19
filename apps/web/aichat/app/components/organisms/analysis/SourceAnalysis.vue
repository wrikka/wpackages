<script setup lang="ts">


interface SourceAnalysisSummaryData {
  type: 'source_analysis_summary';
  sourceId: string;
  title?: string;
  url: string;
  credibilityScore: number;
  biasAnalysis: string;
}
defineProps<{ 
  summary: SourceAnalysisSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-blue-800">Source Analysis</h3>
    
    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Source:</p>
      <a :href="summary.url" target="_blank" rel="noopener noreferrer" class="p-2 mt-1 text-xs text-blue-700 bg-blue-100 rounded font-mono block truncate hover:underline">
        {{ summary.title || summary.url }}
      </a>
    </div>

    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Credibility Score:</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: summary.credibilityScore + '%' }"></div>
      </div>
      <p class="text-xs text-right text-gray-600">{{ summary.credibilityScore }} / 100</p>
    </div>

    <div>
      <p class="text-sm font-medium text-gray-700">Bias Analysis:</p>
      <p class="mt-1 text-xs text-gray-600 italic">"{{ summary.biasAnalysis }}"</p>
    </div>
  </div>

</template>