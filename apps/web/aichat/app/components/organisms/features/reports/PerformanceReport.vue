<script setup lang="ts">

import CodeBlock from '~/components/CodeBlock.vue';

interface PerformanceReportSummaryData {
  type: 'performance_report_summary';
  snippetId: string;
  bottleneck: string;
  suggestion: string;
  optimizedCode?: string;
}
defineProps<{ 
  summary: PerformanceReportSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-yellow-800">Performance Analysis Report</h3>
    
    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Potential Bottleneck Identified:</p>
      <p class="p-2 mt-1 text-xs text-yellow-800 bg-yellow-100 rounded font-semibold">{{ summary.bottleneck }}</p>
    </div>

    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Suggestion:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.suggestion }}</p>
    </div>

    <div v-if="summary.optimizedCode">
      <p class="mb-2 text-sm font-medium text-gray-700">Optimized Code Example:</p>
      <CodeBlock 
        :language="'javascript'" 
        :originalCode="summary.optimizedCode"
        :refactoredCode="summary.optimizedCode"
        :explanation="''"
        :snippetId="summary.snippetId" 
      />
    </div>
  </div>

</template>