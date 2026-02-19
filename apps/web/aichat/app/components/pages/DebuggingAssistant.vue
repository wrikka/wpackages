<script setup lang="ts">


interface DebugSummaryData {
  type: 'debug_summary';
  sessionId: string;
  errorMessage: string;
  analysis: string;
  suggestedFix: string;
}
defineProps<{ 
  summary: DebugSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-red-800">Debugging Assistant</h3>
    
    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Error Message:</p>
      <p class="p-2 mt-1 text-xs text-red-700 bg-red-100 rounded font-mono">{{ summary.errorMessage }}</p>
    </div>

    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Analysis:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.analysis }}</p>
    </div>

    <div>
      <p class="text-sm font-medium text-gray-700">Suggested Fix:</p>
      <p class="p-2 mt-1 text-xs text-green-800 bg-green-100 rounded">{{ summary.suggestedFix }}</p>
    </div>
  </div>

</template>