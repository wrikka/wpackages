<script setup lang="ts">

import CodeBlock from '../atoms/CodeBlock.vue';

interface CodeGolfSummaryData {
  type: 'code_golf_summary';
  originalCode: string;
  golfedCode: string;
  characterSavings: number;
  explanation: string;
}
defineProps<{ 
  summary: CodeGolfSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">"Code Golf" Optimizer</h3>
    <p class="mb-4 text-sm text-gray-500">Saved <span class="font-bold text-green-600">{{ summary.characterSavings }}</span> characters!</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p class="mb-2 text-sm font-medium text-gray-700">Original Code:</p>
        <CodeBlock 
          :language="'javascript'" 
          :originalCode="summary.originalCode"
          :refactoredCode="summary.originalCode"
          :explanation="''"
          :snippetId="''" 
        />
      </div>
      <div>
        <p class="mb-2 text-sm font-medium text-gray-700">Golfed Code:</p>
        <CodeBlock 
          :language="'javascript'" 
          :originalCode="summary.golfedCode"
          :refactoredCode="summary.golfedCode"
          :explanation="''"
          :snippetId="''" 
        />
      </div>
    </div>
    <div class="mt-4">
      <p class="text-sm font-medium text-gray-700">Explanation:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.explanation }}</p>
    </div>
  </div>

</template>