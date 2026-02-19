<script setup lang="ts">

import CodeBlock from '~/components/CodeBlock.vue';

interface DesignPatternSummaryData {
  type: 'design_pattern_summary';
  problemDescription: string;
  patternName: string;
  description: string;
  exampleCode?: string;
}
defineProps<{ 
  summary: DesignPatternSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-1 text-lg font-semibold text-gray-800">Design Pattern Suggestion</h3>
    <p class="mb-4 text-sm text-gray-500">For your problem: "<span class="italic">{{ summary.problemDescription }}</span>"</p>

    <div class="p-3 bg-gray-50 rounded-md">
      <h4 class="font-semibold text-indigo-700">{{ summary.patternName }}</h4>
      <p class="mt-2 text-xs text-gray-600">{{ summary.description }}</p>
    </div>

    <div v-if="summary.exampleCode" class="mt-4">
      <p class="mb-2 text-sm font-medium text-gray-700">Example:</p>
      <CodeBlock 
        :language="'javascript'" 
        :originalCode="summary.exampleCode"
        :refactoredCode="summary.exampleCode"
        :explanation="''"
        :snippetId="''" 
      />
    </div>
  </div>

</template>