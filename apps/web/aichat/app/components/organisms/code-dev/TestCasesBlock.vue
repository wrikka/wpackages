<script setup lang="ts">

import CodeBlock from '~/components/CodeBlock.vue';

interface TestCasesSummaryData {
  type: 'test_cases_summary';
  snippetId: string;
  framework: string;
  code: string;
}
defineProps<{ 
  summary: TestCasesSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-gray-900 border border-gray-700 rounded-lg shadow-sm">
    <h4 class="mb-3 text-md font-semibold text-gray-200">Generated Test Cases</h4>
    <p class="mb-2 text-xs text-gray-400">Framework: <span class="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-300 rounded-md">{{ summary.framework }}</span></p>
    <CodeBlock 
      :language="'typescript'" 
      :originalCode="summary.code"
      :refactoredCode="summary.code"
      :explanation="''"
    />
  </div>

</template>